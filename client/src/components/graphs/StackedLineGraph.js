import React from 'react'
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
    margin={{ top: 40, right: 80, bottom: 80, left: 90 }}
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
    curve='monotoneX'
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
      legendOffset: -70,
      legendPosition: 'middle'
    }}
    enablePoints={false}
    pointSize={10}
    pointColor={{ theme: 'background' }}
    pointBorderWidth={2}
    pointBorderColor={{ from: 'serieColor' }}
    pointLabelYOffset={-12}
    enableArea={true}
    areaOpacity={0.2}
    useMesh={false}
    theme={theme}
    colors={{ datum: 'color' }}
  />
);

function StackedLineGraph(props) {
  const upper = props.data.map(entry => {
    return {
      id: entry.id,
      color: entry.color,
      data: entry.data.map(data => {
        return {
          'x': data.x,
          'y': Math.trunc(data.y * (1.0 + entry.margin_of_error / 100.0))
        };
      })
    };
  });

  const lower = props.data.map(entry => {
    return {
      id: entry.id,
      color: entry.color,
      data: entry.data.map(data => {
        return {
          'x': data.x,
          'y': Math.trunc(data.y * (1.0 - entry.margin_of_error / 100.0))
        };
      })
    };
  });

  let graphData = [];

  lower.forEach((entry, index) => {
    graphData.push(entry);
    graphData.push(upper[index]);
  });

  return (
    <div className="StackedLineGraph">
      {Graph(graphData, props.maximumXValue)}
    </div>
  );
}

export default StackedLineGraph;
