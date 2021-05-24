import React from "react";

export const msInSecond = 1000;
export const msInMinute = msInSecond * 60;
export const msInHour = msInMinute * 60;
export const msInDay = msInHour * 24;
export const msInWeek = msInDay * 7;
export const Hour = 'Hour';
export const Day = 'Day';
export const Week = 'Week';
export const Positive = 1;
export const Negative = -1;
export const Neutral = 0;

export const getUnits = (timeFrame) => {
  switch (timeFrame) {
    case Hour:
      return msInMinute;
    case Day:
      return msInHour;
    case Week:
      return msInDay;
    default:
      console.error(`getUnits(${timeFrame}) fell through switch!`);
  }
}

export const getMaximumXValue = (timeFrame) => {
  switch (timeFrame) {
    case Hour:
      return 60;
    case Day:
      return 24;
    case Week:
      return 7;
    default:
      console.error(`getMaximumXValue(${timeFrame}) fell through switch!`);
  }
}

export const getSentimentColor = (sentiment) => {
  switch (sentiment) {
    case Positive:
      return '#71bdb4';
    case Negative:
      return '#a35a52';
    case Neutral:
      return '#bab7a2';
    default:
      console.error(`getSentimentColor(${sentiment}) fell through switch!`);
  }
}

export const getTimeBetween = (a, b, units) => {
  return Math.abs(a.getTime() - b.getTime()) / units;
}

export const filterMessages = (messages, timeFrame, fromDateTime) => {
  let timeRange;

  switch(timeFrame) {
    case Hour:
      timeRange = msInHour + msInMinute;
      break;
    case Day:
      timeRange = msInDay + msInHour;
      break;
    case Week:
      timeRange = msInWeek + msInDay;
      break;
    default:
      console.error(`filterMessages(${timeFrame}) fell through switch!`);
  }

  return messages.filter(msg => {
    const difference = new Date(msg['time_stamp']) - fromDateTime;
    return difference < timeRange && difference >= 0;
  });
}

export const getSentimentName = (sentiment) => {
  switch (sentiment) {
    case Positive:
      return 'positive';
    case Negative:
      return 'negative';
    case Neutral:
      return 'neutral';
    default:
      console.error(`getSentimentName(${sentiment}) fell through switch!`);
  }
}

export const getCountsData = (counts) => {
  return Object.entries(counts).map(([time, count]) => {
    return { 'x': time, 'y': count };
  })
}

export const getGraphData = (messages, timeFrame, fromDateTime) => {
  if (messages.length == 0) {
    return [];
  }

  messages = filterMessages(messages, timeFrame, fromDateTime);
  let sentimentCounts = [{}, {}, {}];

  // Populate message sentiment counts at the appropriate times.
  for (const msg of messages) {
    const msgSentiment = msg['sentiment'];
    const msgDate = new Date(msg['time_stamp']);
    const units = getUnits(timeFrame);
    const time = Math.floor(getTimeBetween(fromDateTime, msgDate, units));
    let counts = sentimentCounts[msgSentiment + 1];

    counts[time] = (counts[time] || 0) + 1;
  }

  // Make sure there is a count at each interval.
  for (let time = 0; time <= getMaximumXValue(timeFrame); time++) {
    sentimentCounts.forEach(counts => {
      counts[time] = counts[time] || 0;
    });
  }

  const data = sentimentCounts.map((counts, index) => {
    const sentiment = index - 1;
    return {
      id: sentiment,
      color: getSentimentColor(sentiment),
      data: getCountsData(counts)
    };
  });

  return [data[0], data[2], data[1]];
}

export const getExportData = (graphData, fromDateTime, timeFrame) => {
  if (graphData.length == 0) {
    return [];
  }

  let exportData = [['']];

  graphData[0].data.forEach(dataPoint => {
    const date = new Date(
      fromDateTime.getTime() + dataPoint['x'] * getUnits(timeFrame)
    );
    const str = `${date.getDate()}/${date.getMonth() + 1}`
      + `/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;

    exportData[0].push(str);
  });

  graphData.forEach(data => {
    exportData.push([
      getSentimentName(data.id),
      ...data.data.map(dataPoint => dataPoint['y'])
    ]);
  });

  return exportData;
}

export const getMarginOfError = (accuracy, samples) => {
  const standardDeviations = 1.96; // 95% CI

  return Math.round(
    standardDeviations
    * Math.sqrt((1.0 - accuracy) * accuracy / samples)
    * 100
  );
}
