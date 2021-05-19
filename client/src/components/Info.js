import React, {useState, useEffect} from 'react'
import './Info.css'

function Info(props) {
  function getMarginOfError(accuracy, samples) {
    const standardDeviations = 1.96; // 95% CI

    return Math.round(
      standardDeviations
      * Math.sqrt((1.0 - accuracy) * accuracy / samples)
      * 100
    );
  }

  return (
    <div className='Info'>
      <div className='InfoHeader'>
        <h1>Sentiment Analysis Model Breakdown</h1>
      </div>
      <div className='InfoBody'>
        <table>
          <tr>
            <th></th>
            <th>Precision</th>
            <th>Recall</th>
            <th>F1-Score</th>
            <th>Support</th>
            <th>Margin of Error</th>
          </tr>
          <tr>
            <td>Positive</td>
            <td>{props.positiveStats['precision']?.toFixed(2)}</td>
            <td>{props.positiveStats['recall']?.toFixed(2)}</td>
            <td>{props.positiveStats['f1-score']?.toFixed(2)}</td>
            <td>{props.positiveStats['support']?.toFixed(2)}</td>
            <td>
              {
                props.positiveStats['precision'] ?
                  getMarginOfError(
                    props.positiveStats['precision'],
                    props.positiveStats['support']
                  ) + '%' :
                  null
              }
            </td>
          </tr>
          <tr>
            <td>Negative</td>
            <td>{props.negativeStats['precision']?.toFixed(2)}</td>
            <td>{props.negativeStats['recall']?.toFixed(2)}</td>
            <td>{props.negativeStats['f1-score']?.toFixed(2)}</td>
            <td>{props.negativeStats['support']?.toFixed(2)}</td>
            <td>
              {
                props.negativeStats['precision'] ?
                  getMarginOfError(
                    props.negativeStats['precision'],
                    props.negativeStats['support']
                  ) + '%' :
                  null
              }
            </td>
          </tr>
          <tr>
            <td>Neutral</td>
            <td>{props.neutralStats['precision']?.toFixed(2)}</td>
            <td>{props.neutralStats['recall']?.toFixed(2)}</td>
            <td>{props.neutralStats['f1-score']?.toFixed(2)}</td>
            <td>{props.neutralStats['support']?.toFixed(2)}</td>
            <td>
              {
                props.neutralStats['precision'] ?
                  getMarginOfError(
                    props.neutralStats['precision'],
                    props.neutralStats['support']
                  ) + '%' :
                  null
              }
            </td>
          </tr>
          <tr>
            <td colspan='6'></td>
          </tr>
          <tr>
            <td>Average</td>
            <td>{props.averages['precision']?.toFixed(2)}</td>
            <td>{props.averages['recall']?.toFixed(2)}</td>
            <td>{props.averages['f1-score']?.toFixed(2)}</td>
            <td>{props.averages['support']?.toFixed(2)}</td>
            <td>
              {
                props.averages['precision'] ?
                  getMarginOfError(
                    props.averages['precision'],
                    props.averages['support']
                  ) + '%' :
                  null
              }
            </td>
          </tr>
          <tr>
            <td colspan='6'></td>
          </tr>
          <tr>
            <td>Total Accuracy</td>
            <td colspan='5'>
              {props.accuracy ? (props.accuracy * 100).toFixed(2) + '%' : null}
            </td>
          </tr>
        </table>
      </div>
      <div className='InfoFooter'>
        <h1></h1>
      </div>
    </div>
  );
}

export default Info;
