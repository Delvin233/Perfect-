// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PerfectLeaderboard {
    struct Score {
        address player;
        uint256 score;
        uint256 level;
        uint256 timestamp;
    }

    mapping(address => Score) public playerScores;
    address[] public players;
    
    event ScoreSubmitted(address indexed player, uint256 score, uint256 level);
    
    function submitScore(uint256 _score, uint256 _level) external {
        if (playerScores[msg.sender].player == address(0)) {
            players.push(msg.sender);
        }
        
        if (_score > playerScores[msg.sender].score) {
            playerScores[msg.sender] = Score({
                player: msg.sender,
                score: _score,
                level: _level,
                timestamp: block.timestamp
            });
            
            emit ScoreSubmitted(msg.sender, _score, _level);
        }
    }
    
    function getPlayerScore(address _player) external view returns (Score memory) {
        return playerScores[_player];
    }
    
    function getTopPlayers(uint256 _count) external view returns (Score[] memory) {
        uint256 count = _count > players.length ? players.length : _count;
        Score[] memory topScores = new Score[](count);
        
        for (uint256 i = 0; i < players.length; i++) {
            Score memory currentScore = playerScores[players[i]];
            
            for (uint256 j = 0; j < count; j++) {
                if (topScores[j].player == address(0) || currentScore.score > topScores[j].score) {
                    for (uint256 k = count - 1; k > j; k--) {
                        topScores[k] = topScores[k - 1];
                    }
                    topScores[j] = currentScore;
                    break;
                }
            }
        }
        
        return topScores;
    }
    
    function getTotalPlayers() external view returns (uint256) {
        return players.length;
    }
}
