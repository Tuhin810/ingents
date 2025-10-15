import React from "react";
import dynamic from "next/dynamic";

// Dynamically import react-apexcharts to avoid SSR errors in Next.js
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export const EmailStats = () => {
  const [chartState]: any = React.useState(() => ({
    series: [76, 67, 61, 90],
    options: {
      chart: {
        height: 100,
        type: "radialBar",
      },
      plotOptions: {
        radialBar: {
          offsetY: 0,
          startAngle: 0,
          endAngle: 270,
          hollow: {
            margin: 5,
            size: "20%",
            background: "transparent",
            image: undefined,
          },
          dataLabels: {
            name: { show: false },
            value: { show: false },
          },
          barLabels: {
            enabled: true,
            useSeriesColors: true,
            offsetX: -8,
            fontSize: "12px",
            formatter: function (seriesName: string, opts: any) {
              return (
                seriesName + ":  " + opts.w.globals.series[opts.seriesIndex]
              );
            },
          },
        },
      },
      colors: ["#1ab7ea", "#0084ff", "#39539E", "#0077B5"],
      labels: ["Email Opened", "In Spam", "Deleted", "Forwarded"],
      responsive: [
        {
          breakpoint: 480,
          options: { legend: { show: false } },
        },
      ],
    },
  }));

  return (
    <div>
      <div className="bg-white rounded-2xl px-6 pt-6 shadow-sm flex flex-col hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold text-gray-800">
          Email Statistics
        </h3>
        <div className="flex-grow flex items-center justify-center mt-2">
          {/* Chart container - renders client-side only */}
          <div id="chart" className="w-full -mt-4 max-w-md">
            {/* If react-apexcharts is not installed this will fail at runtime. */}
            <ReactApexChart
              options={chartState.options}
              series={chartState.series}
              type="radialBar"
              height={270}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
