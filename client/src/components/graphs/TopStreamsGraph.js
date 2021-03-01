import React, {useState} from 'react'
import twitch from '../../themes'
// install (please make sure versions match peerDependencies)
// yarn add @nivo/core @nivo/bar
import { ResponsiveBar } from '@nivo/bar'
// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const theme = {
  axis: {
    fontSize: "14px",
    tickColor: "#eee",
    ticks: {
      line: {
        stroke: "#555555"
      },
      text: {
        fill: "#ffffff"
      }
    },
    legend: {
      text: {
        fill: "#aaaaaa"
      }
    }
  },
  grid: {
    line: {
      stroke: "#555555"
    }
  }
};
const BarChart = (data, max) => (
	<ResponsiveBar
		data={data}
		keys={['viewers']}
		indexBy='stream'
		margin={{ top: 50, right: 130, bottom: 50, left: 130 }}
		padding={0.3}
		valueScale={{ type: 'linear', min: 0, max: max }}
		indexScale={{ type: 'band', round: true }}
    colors={[twitch.lightText]}
		defs={[]}
		fill={[]}
		borderColor={'white'}
		axisTop={null}
		axisRight={null}
		axisBottom={{
			tickSize: 5,
			tickPadding: 1,
			tickRotation: 0,
			legend: 'stream',
			legendPosition: 'middle',
			legendOffset: 32
		}}
		axisLeft={{
			tickSize: 5,
			tickPadding: 5,
			tickRotation: 0,
			legend: 'viewers',
			legendPosition: 'middle',
			legendOffset: -80
		}}
		labelSkipWidth={12}
		labelSkipHeight={12}
    labelTextColor={'white'}
		legends={[]}
		animate={true}
		motionStiffness={90}
		motionDamping={15}
    theme={theme}
	/>
);

function TopStreamsGraph(props) {
  const max = props.streams.length > 0
    ? Math.max.apply(Math, props.streams.map((stream) => stream.viewer_count))
    : 100;

  return (
    BarChart(props.streams.map((stream, index) => {
      return { stream: stream.user_name, viewers: stream.viewer_count };
    }).slice(0, 10), max)
  );
}

export default TopStreamsGraph;
