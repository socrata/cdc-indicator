/* eslint-disable */
import React, { PropTypes } from 'react';
import C3ChartUpdatable from './C3ChartUpdatable';

const LineChart = ({ chartData, desc, title }) => {
  const chartConfig = chartData.chartConfig();
  chartConfig.data.type = 'line';
  chartConfig.line = {
    connectNull: false
  };
  
  const myScale = chartData.scale;

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
