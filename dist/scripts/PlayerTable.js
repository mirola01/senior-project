import React from 'react';
import PropTypes from 'prop-types';

const PlayerTable = ({ players }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Age</th>
          <th>Position</th>
        </tr>
      </thead>
      <tbody>
        {players.map((player, index) => (
          <tr key={player.id || index}>
            <td>{player.name}</td>
            <td>{player.age}</td>
            <td>{player.position}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

PlayerTable.propTypes = {
  players: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string.isRequired,
      age: PropTypes.number.isRequired,
      position: PropTypes.string.isRequired
    })
  ).isRequired
};
export default PlayerTable;
