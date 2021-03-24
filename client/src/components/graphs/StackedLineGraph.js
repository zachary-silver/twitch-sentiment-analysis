import React from 'react'
// install (please make sure versions match peerDependencies)
// yarn add @nivo/core @nivo/line
import { ResponsiveLine } from '@nivo/line'
// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const theme = {
  axis: {
    tickColor: "#eee",
    ticks: {
      line: {
        stroke: "#555555"
      },
      text: {
        fill: "#ffffff",
        fontSize: 14
      }
    },
    legend: {
      text: {
        fill: "#ffffff",
        fontSize: 20
      }
    }
  },
  grid: {
    line: {
      stroke: "#555555"
    }
  }
};

const Graph = (data, maximumXValue) => (
  <ResponsiveLine
    data={data}
    margin={{ top: 20, right: 80, bottom: 80, left: 80 }}
    xScale={{
      type: 'linear',
      min: 0,
      max: maximumXValue
    }}
    yScale={{
      type: 'linear',
      min: 0,
      max: 'auto',
      stacked: false,
      reverse: false
    }}
    curve="linear"
    axisTop={null}
    axisRight={null}
    axisBottom={{
      orient: 'bottom',
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: 'Time',
      legendOffset: 60,
      legendPosition: 'middle'
    }}
    axisLeft={{
      orient: 'left',
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: 'Messages',
      legendOffset: -60,
      legendPosition: 'middle'
    }}
    pointSize={10}
    pointColor={{ theme: 'background' }}
    pointBorderWidth={2}
    pointBorderColor={{ from: 'serieColor' }}
    pointLabelYOffset={-12}
    enableArea={true}
    areaOpacity={0.5}
    useMesh={true}
    theme={theme}
  />
);

function StackedLineGraph(props) {
  return (
    <div className="StackedLineGraph">
      {Graph(props.data, props.maximumXValue)}
    </div>
  );
}

export default StackedLineGraph;
