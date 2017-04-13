import React, { PropTypes } from 'react';
import C3ChartUpdatable from './C3ChartUpdatable';
import d3 from 'd3';

const LineChart = ({ chartData, desc, title }) => {
  const chartConfig = chartData.chartConfig();
  chartConfig.data.type = 'line';
  chartConfig.line = {
    connectNull: false
  };

  const scaleValues = chartData.data.map(x => x.data_value);
  const lowerBound = d3.min(scaleValues);
  const upperBound = Math.round(d3.max(scaleValues));

  // break chart data from 0 to min
  const myScale = d3.scale.linear()
                  .domain([0, 0, lowerBound, upperBound])
                  .range([0, 0, 10, 100]);

  // transform y column data using scale
  chartConfig.data.columns = chartConfig.data.columns.map((values, idxValues) => {
    return values.map((value, idxValue) => {
      return idxValues > 0 && idxValue > 0 ? myScale(value) : value;
    });
  });

  // set y axis to set range from 0 to 100
  // min and max should match the range in myScale
  // rescaled data will retain original position in chart
  // tick format will use scale to show original value
  chartConfig.axis.y = {
    min: 0,
    max: 100,
    padding: {
      top: 20,
      bottom: 0
    },
    tick: {
      format: (d) => {
        let retval = null;
        if (!(d > myScale.range()[1] && d < myScale.range()[2])) {
          retval = parseFloat(myScale.invert(d)).toFixed(1);
        }
        return retval;
      }
    }
  };

  const longDesc = `This chart displays ${desc} as a line chart. ` +
    `${chartData.xValues} values are on X axis.`;

  return (
    <C3ChartUpdatable {...chartConfig} desc={longDesc} title={title} scale={myScale} />
  );
};

LineChart.propTypes = {
  chartData: PropTypes.object,
  desc: PropTypes.string,
  title: PropTypes.string
};

export default LineChart;
