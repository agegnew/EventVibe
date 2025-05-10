"use client"

import { useEffect, useRef } from "react"

interface AdminChartProps {
  type: "bar" | "line" | "pie" | "area" | "donut"
}

export function AdminChart({ type }: AdminChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chartRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = chartRef.current.clientWidth
      canvas.height = chartRef.current.clientHeight
      chartRef.current.appendChild(canvas)

      const ctx = canvas.getContext("2d")
      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Set colors based on chart type
        const colors = {
          bar: ["#8b5cf6", "#3b82f6", "#ec4899", "#10b981", "#f59e0b", "#ef4444"],
          line: "#8b5cf6",
          pie: ["#8b5cf6", "#3b82f6", "#ec4899", "#10b981", "#f59e0b"],
          area: "#8b5cf6",
          donut: ["#8b5cf6", "#3b82f6", "#ec4899", "#10b981", "#f59e0b"],
        }

        // Draw chart based on type
        switch (type) {
          case "bar":
            drawBarChart(ctx, canvas.width, canvas.height, colors.bar)
            break
          case "line":
            drawLineChart(ctx, canvas.width, canvas.height, colors.line)
            break
          case "pie":
            drawPieChart(ctx, canvas.width, canvas.height, colors.pie)
            break
          case "area":
            drawAreaChart(ctx, canvas.width, canvas.height, colors.area)
            break
          case "donut":
            drawDonutChart(ctx, canvas.width, canvas.height, colors.donut)
            break
        }
      }

      return () => {
        if (chartRef.current && canvas.parentNode === chartRef.current) {
          chartRef.current.removeChild(canvas)
        }
      }
    }
  }, [type])

  return <div ref={chartRef} className="w-full h-full"></div>
}

// Helper functions to draw different chart types
function drawBarChart(ctx: CanvasRenderingContext2D, width: number, height: number, colors: string[]) {
  const data = [65, 59, 80, 81, 56, 55]
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
  const barWidth = width / (data.length * 2)
  const maxValue = Math.max(...data)

  // Draw axes
  ctx.strokeStyle = "#d1d5db"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(40, 20)
  ctx.lineTo(40, height - 40)
  ctx.lineTo(width - 20, height - 40)
  ctx.stroke()

  // Draw bars
  data.forEach((value, index) => {
    const x = 40 + (index * 2 + 1) * barWidth
    const barHeight = (value / maxValue) * (height - 80)

    ctx.fillStyle = colors[index % colors.length]
    ctx.fillRect(x, height - 40 - barHeight, barWidth, barHeight)

    // Draw label
    ctx.fillStyle = "#6b7280"
    ctx.font = "12px Arial"
    ctx.textAlign = "center"
    ctx.fillText(labels[index], x + barWidth / 2, height - 20)
  })

  // Draw y-axis labels
  ctx.fillStyle = "#6b7280"
  ctx.font = "12px Arial"
  ctx.textAlign = "right"
  for (let i = 0; i <= 5; i++) {
    const value = Math.round((maxValue / 5) * i)
    const y = height - 40 - (i / 5) * (height - 80)
    ctx.fillText(value.toString(), 35, y + 5)
  }
}

function drawLineChart(ctx: CanvasRenderingContext2D, width: number, height: number, color: string) {
  const data = [65, 59, 80, 81, 56, 55, 70]
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]
  const maxValue = Math.max(...data)
  const pointSpacing = (width - 60) / (data.length - 1)

  // Draw axes
  ctx.strokeStyle = "#d1d5db"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(40, 20)
  ctx.lineTo(40, height - 40)
  ctx.lineTo(width - 20, height - 40)
  ctx.stroke()

  // Draw line
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.beginPath()
  data.forEach((value, index) => {
    const x = 40 + index * pointSpacing
    const y = height - 40 - (value / maxValue) * (height - 80)

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.stroke()

  // Draw points
  data.forEach((value, index) => {
    const x = 40 + index * pointSpacing
    const y = height - 40 - (value / maxValue) * (height - 80)

    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, Math.PI * 2)
    ctx.stroke()

    // Draw label
    ctx.fillStyle = "#6b7280"
    ctx.font = "12px Arial"
    ctx.textAlign = "center"
    ctx.fillText(labels[index], x, height - 20)
  })

  // Draw y-axis labels
  ctx.fillStyle = "#6b7280"
  ctx.font = "12px Arial"
  ctx.textAlign = "right"
  for (let i = 0; i <= 5; i++) {
    const value = Math.round((maxValue / 5) * i)
    const y = height - 40 - (i / 5) * (height - 80)
    ctx.fillText(value.toString(), 35, y + 5)
  }
}

function drawPieChart(ctx: CanvasRenderingContext2D, width: number, height: number, colors: string[]) {
  const data = [30, 20, 25, 15, 10]
  const labels = ["Technology", "Design", "Marketing", "Business", "Other"]
  const total = data.reduce((sum, value) => sum + value, 0)
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) / 2 - 40

  let startAngle = 0

  // Draw pie slices
  data.forEach((value, index) => {
    const sliceAngle = (value / total) * 2 * Math.PI

    ctx.fillStyle = colors[index % colors.length]
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
    ctx.closePath()
    ctx.fill()

    // Calculate position for label
    const labelAngle = startAngle + sliceAngle / 2
    const labelX = centerX + (radius + 20) * Math.cos(labelAngle)
    const labelY = centerY + (radius + 20) * Math.sin(labelAngle)

    // Draw label line
    ctx.strokeStyle = "#d1d5db"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(centerX + radius * Math.cos(labelAngle), centerY + radius * Math.sin(labelAngle))
    ctx.lineTo(labelX, labelY)
    ctx.stroke()

    // Draw label
    ctx.fillStyle = "#6b7280"
    ctx.font = "12px Arial"
    ctx.textAlign = labelX > centerX ? "left" : "right"
    ctx.fillText(`${labels[index]} (${Math.round((value / total) * 100)}%)`, labelX, labelY)

    startAngle += sliceAngle
  })
}

function drawAreaChart(ctx: CanvasRenderingContext2D, width: number, height: number, color: string) {
  const data = [30, 40, 35, 50, 45, 60, 55]
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]
  const maxValue = Math.max(...data)
  const pointSpacing = (width - 60) / (data.length - 1)

  // Draw axes
  ctx.strokeStyle = "#d1d5db"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(40, 20)
  ctx.lineTo(40, height - 40)
  ctx.lineTo(width - 20, height - 40)
  ctx.stroke()

  // Draw area
  ctx.fillStyle = `${color}33` // Add transparency
  ctx.beginPath()
  ctx.moveTo(40, height - 40)

  data.forEach((value, index) => {
    const x = 40 + index * pointSpacing
    const y = height - 40 - (value / maxValue) * (height - 80)
    ctx.lineTo(x, y)
  })

  ctx.lineTo(40 + (data.length - 1) * pointSpacing, height - 40)
  ctx.closePath()
  ctx.fill()

  // Draw line
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.beginPath()

  data.forEach((value, index) => {
    const x = 40 + index * pointSpacing
    const y = height - 40 - (value / maxValue) * (height - 80)

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })

  ctx.stroke()

  // Draw points
  data.forEach((value, index) => {
    const x = 40 + index * pointSpacing
    const y = height - 40 - (value / maxValue) * (height - 80)

    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, Math.PI * 2)
    ctx.stroke()

    // Draw label
    ctx.fillStyle = "#6b7280"
    ctx.font = "12px Arial"
    ctx.textAlign = "center"
    ctx.fillText(labels[index], x, height - 20)
  })

  // Draw y-axis labels
  ctx.fillStyle = "#6b7280"
  ctx.font = "12px Arial"
  ctx.textAlign = "right"
  for (let i = 0; i <= 5; i++) {
    const value = Math.round((maxValue / 5) * i)
    const y = height - 40 - (i / 5) * (height - 80)
    ctx.fillText(value.toString(), 35, y + 5)
  }
}

function drawDonutChart(ctx: CanvasRenderingContext2D, width: number, height: number, colors: string[]) {
  const data = [40, 30, 20, 10]
  const labels = ["18-24", "25-34", "35-44", "45+"]
  const total = data.reduce((sum, value) => sum + value, 0)
  const centerX = width / 2
  const centerY = height / 2
  const outerRadius = Math.min(width, height) / 2 - 40
  const innerRadius = outerRadius * 0.6

  let startAngle = 0

  // Draw donut slices
  data.forEach((value, index) => {
    const sliceAngle = (value / total) * 2 * Math.PI

    ctx.fillStyle = colors[index % colors.length]
    ctx.beginPath()
    ctx.moveTo(
      centerX + innerRadius * Math.cos(startAngle + sliceAngle / 2),
      centerY + innerRadius * Math.sin(startAngle + sliceAngle / 2),
    )
    ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle)
    ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true)
    ctx.closePath()
    ctx.fill()

    // Calculate position for label
    const labelAngle = startAngle + sliceAngle / 2
    const labelRadius = outerRadius + 20
    const labelX = centerX + labelRadius * Math.cos(labelAngle)
    const labelY = centerY + labelRadius * Math.sin(labelAngle)

    // Draw label
    ctx.fillStyle = "#6b7280"
    ctx.font = "12px Arial"
    ctx.textAlign = "center"
    ctx.fillText(`${labels[index]} (${Math.round((value / total) * 100)}%)`, labelX, labelY)

    startAngle += sliceAngle
  })

  // Draw center text
  ctx.fillStyle = "#1f2937"
  ctx.font = "bold 16px Arial"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("Age Groups", centerX, centerY)
}
