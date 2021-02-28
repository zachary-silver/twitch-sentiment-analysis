import React, {useState} from 'react'
// install (please make sure versions match peerDependencies)
// yarn add @nivo/core @nivo/bar
import { ResponsiveBar } from '@nivo/bar'
// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const BarChart = (data) => (
	<ResponsiveBar
		data={data}
		keys={['viewers']}
		indexBy='game'
		margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
		padding={0.3}
		valueScale={{ type: 'linear' }}
		indexScale={{ type: 'band', round: true }}
		colors={{ scheme: 'purpleRed_green' }}
		defs={[]}
		fill={[]}
		borderColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
		axisTop={null}
		axisRight={null}
		axisBottom={{
			tickSize: 5,
			tickPadding: 5,
			tickRotation: 0,
			legend: 'game',
			legendPosition: 'middle',
			legendOffset: 32
		}}
		axisLeft={{
			tickSize: 5,
			tickPadding: 5,
			tickRotation: 0,
			legend: 'viewers',
			legendPosition: 'middle',
			legendOffset: -40
		}}
		labelSkipWidth={12}
		labelSkipHeight={12}
		labelTextColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
		legends={[]}
		animate={true}
		motionStiffness={90}
		motionDamping={15}
	/>
);

function Games(props) {
  return BarChart(props.results.map((game, index) => {
    return { game: game.name, viewers: index };
  }));
}

export default Games;
