'use client'

import { useEffect, useRef, useState } from 'react'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import { AnnotationLayer, TextLayer } from 'pdfjs-dist'

interface PdfPageProps {
  doc: PDFDocumentProxy
  pageNumber: number
  scale: number
  onVisible?: (pageNumber: number) => void
}

export default function PdfPage({ doc, pageNumber, scale, onVisible }: PdfPageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textLayerRef = useRef<HTMLDivElement>(null)
  const annotationLayerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    let cancelled = false
    doc.getPage(pageNumber).then((page) => {
      if (cancelled) return
      const vp = page.getViewport({ scale })
      setDimensions({ width: vp.width, height: vp.height })
    })
    return () => {
      cancelled = true
    }
  }, [doc, pageNumber, scale])

  useEffect(() => {
    const el = containerRef.current
    if (!el || !onVisible) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            onVisible(pageNumber)
          }
        }
      },
      { threshold: [0.5] }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [pageNumber, onVisible])

  useEffect(() => {
    let cancelled = false
    let renderTask: ReturnType<PDFPageProxy['render']> | null = null
    let textLayer: TextLayer | null = null

    async function renderPage() {
      if (!canvasRef.current || !textLayerRef.current || !annotationLayerRef.current) return

      try {
        const page = await doc.getPage(pageNumber)
        if (cancelled) return

        const viewport = page.getViewport({ scale })
        const dpr = window.devicePixelRatio || 1

        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        if (!context) return

        canvas.width = Math.floor(viewport.width * dpr)
        canvas.height = Math.floor(viewport.height * dpr)
        canvas.style.width = `${Math.floor(viewport.width)}px`
        canvas.style.height = `${Math.floor(viewport.height)}px`

        context.save()
        context.scale(dpr, dpr)
        renderTask = page.render({ canvasContext: context, viewport })
        await renderTask.promise
        context.restore()

        if (cancelled) return

        const textLayerDiv = textLayerRef.current
        textLayerDiv.innerHTML = ''
        textLayerDiv.style.width = `${Math.floor(viewport.width)}px`
        textLayerDiv.style.height = `${Math.floor(viewport.height)}px`

        const textContent = await page.getTextContent()
        if (cancelled) return

        textLayer = new TextLayer({
          textContentSource: textContent,
          container: textLayerDiv,
          viewport,
        })
        await textLayer.render()

        if (cancelled) return

        const annotationDiv = annotationLayerRef.current
        annotationDiv.innerHTML = ''
        annotationDiv.style.width = `${Math.floor(viewport.width)}px`
        annotationDiv.style.height = `${Math.floor(viewport.height)}px`

        const annotations = await page.getAnnotations()
        if (cancelled || annotations.length === 0) return

        const linkService = {
          pagesCount: doc.numPages,
          page: pageNumber,
          rotation: 0,
          isInPresentationMode: false,
          externalLinkEnabled: true,
          goToDestination: async () => {},
          goToPage: () => {},
          getDestinationHash: () => '#',
          getAnchorUrl: (hash: string) => hash,
          setHash: () => {},
          executeNamedAction: () => {},
          executeSetOCGState: () => {},
          addLinkAttributes: (element: HTMLAnchorElement, url: string, newWindow = true) => {
            element.href = url
            if (newWindow) {
              element.target = '_blank'
              element.rel = 'noopener noreferrer'
            }
          },
        }

        const annotationViewport = viewport.clone({ dontFlip: true })
        const annotationLayer = new AnnotationLayer({
          div: annotationDiv,
          page,
          viewport: annotationViewport,
          accessibilityManager: undefined,
          annotationCanvasMap: undefined,
          annotationEditorUIManager: undefined,
          structTreeLayer: undefined,
        })
        await annotationLayer.render({
          viewport: annotationViewport,
          div: annotationDiv,
          annotations,
          page,
          linkService,
          renderForms: false,
        })
      } catch (err: unknown) {
        if ((err as { name?: string })?.name !== 'RenderingCancelledException') {
          console.error(`Error rendering page ${pageNumber}`, err)
        }
      }
    }

    renderPage()

    return () => {
      cancelled = true
      if (renderTask) {
        renderTask.cancel()
      }
      textLayer?.cancel()
    }
  }, [doc, pageNumber, scale])

  return (
    <div
      ref={containerRef}
      id={`pdf-page-${pageNumber}`}
      data-page-number={pageNumber}
      style={{
        width: dimensions ? `${dimensions.width}px` : undefined,
        minHeight: dimensions ? `${dimensions.height}px` : '400px',
      }}
      className="relative overflow-hidden rounded-lg bg-white shadow-[0_12px_36px_-24px_rgba(15,23,42,0.45)] transition-shadow duration-200 hover:shadow-[0_16px_44px_-20px_rgba(15,23,42,0.5)]"
    >
      <canvas ref={canvasRef} className="block" />
      <div ref={textLayerRef} className="textLayer" />
      <div ref={annotationLayerRef} className="annotationLayer" />
    </div>
  )
}
