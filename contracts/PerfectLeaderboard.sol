// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PerfectLeaderboard
 * @dev Enhanced multi-chain leaderboard contract for Perfect? arcade game
 * @notice Supports Base and Celo networks with comprehensive player statistics
 * @author Perfect? Team
 * 
 * Features:
 * - Enhanced player statistics and game run tracking
 * - Stage completion milestones and achievements
 * - Perfect hits accuracy tracking
 * - Revenue generation with continue system
 * - Gas-optimized storage and operations
 * - Multi-chain deployment support
 * - Daily challenges and tournaments
 * - NFT integration ready
 */
contract PerfectLeaderboard is Ownable, ReentrancyGuard, Pausable {
    
    // Gas-optimized player statistics (packed struct)
    struct PlayerStats {
        uint128 highScore;           // Max score: ~3.4e38 (more than enough)
        uint32 highestLevel;         // Max level: 4.2B (way more than needed)
        uint32 totalGames;           // Total games played
        uint32 perfectHits;          // Total perfect hits (±10ms)
        uint32 totalHits;            // Total hits attempted
        uint32 firstPlayedTimestamp; // When player first played (packed)
        uint32 lastPlayedTimestamp;  // Last game timestamp (packed)
        uint16 longestStreak;        // Longest perfect hit streak
        uint8 stagesCompleted;       // Stages completed (0-3)
        uint8 achievements;          // Bitfield for achievements (8 achievements max)
        bool isActive;               // Player is active
    }
    
    // Gas-optimized game run structure
    struct GameRun {
        uint128 score;               // Game score
        uint32 timestamp;            // When game was played
        uint16 level;                // Level reached
        uint16 perfectHits;          // Perfect hits in this run
        uint16 totalHits;            // Total hits in this run
        uint8 stageReached;          // Stage reached (1-3)
        uint8 continuesUsed;         // Number of continues purchased
    }
    
    // Daily challenge structure
    struct DailyChallenge {
        uint32 date;                 // Challenge date (days since epoch)
        uint32 seed;                 // Random seed for challenge
        uint128 topScore;            // Highest score for the day
        address topPlayer;           // Player with highest score
        uint16 participants;         // Number of participants
        bool active;                 // Challenge is active
    }
    
    // Achievement definitions (bitfield positions)
    uint8 constant ACHIEVEMENT_FIRST_GAME = 0;      // Played first game
    uint8 constant ACHIEVEMENT_STAGE_1 = 1;         // Completed Stage 1
    uint8 constant ACHIEVEMENT_STAGE_2 = 2;         // Completed Stage 2  
    uint8 constant ACHIEVEMENT_STAGE_3 = 3;         // Completed Stage 3
    uint8 constant ACHIEVEMENT_PERFECT_STREAK = 4;  // 10+ perfect hits in a row
    uint8 constant ACHIEVEMENT_HIGH_SCORER = 5;     // Top 10 all-time
    uint8 constant ACHIEVEMENT_VETERAN = 6;         // 100+ games played
    uint8 constant ACHIEVEMENT_PERFECTIONIST = 7;  // 90%+ perfect hit ratio
    
    // State variables
    mapping(address => PlayerStats) public playerStats;
    mapping(address => GameRun[]) public playerRuns;
    mapping(uint32 => DailyChallenge) public dailyChallenges;
    mapping(uint32 => mapping(address => uint128)) public dailyScores; // date => player => score
    
    address[] public players;
    address[] public topPlayers; // Gas-optimized top 100 cache
    
    // Game configuration constants
    uint16 public constant STAGE_1_LEVELS = 10;
    uint16 public constant STAGE_2_LEVELS = 20;
    uint16 public constant STAGE_3_LEVELS = 30;
    uint16 public constant MAX_LEADERBOARD_SIZE = 100;
    
    // Revenue and fee configuration
    uint256 public totalRevenue;
    uint256 public submissionFee = 0.0001 ether;    // Base: ~$0.01, Celo: ~$0.0001
    uint256 public continueFee = 0.001 ether;       // Continue game fee
    uint256 public dailyChallengeFee = 0.0005 ether; // Daily challenge entry
    
    bool public feeEnabled = false;
    bool public continueEnabled = true;
    bool public dailyChallengesEnabled = true;
    
    // Network-specific configuration
    string public networkName;                       // "Base" or "Celo"
    uint256 public chainId;                         // Network chain ID
    
    // Global statistics (gas-optimized)
    uint32 public totalGamesPlayed;
    uint32 public totalPlayersCount;
    uint32 public stage1Completions;
    uint32 public stage2Completions;
    uint32 public stage3Completions;
    
    // Events
    event ScoreSubmitted(
        address indexed player, 
        uint128 score, 
        uint16 level, 
        uint16 perfectHits, 
        uint16 totalHits,
        uint8 stageReached,
        uint8 continuesUsed
    );
    
    event NewHighScore(
        address indexed player, 
        uint128 newScore, 
        uint128 previousScore,
        uint16 level
    );
    
    event StageCompleted(
        address indexed player, 
        uint8 stage, 
        uint32 timestamp,
        uint128 score
    );
    
    event AchievementUnlocked(
        address indexed player,
        uint8 achievement,
        uint32 timestamp
    );
    
    event ContinuePurchased(
        address indexed player,
        uint16 level,
        uint256 fee,
        uint32 timestamp
    );
    
    event DailyChallengeStarted(
        uint32 indexed date,
        uint32 seed,
        uint256 entryFee
    );
    
    event DailyChallengeCompleted(
        uint32 indexed date,
        address indexed winner,
        uint128 winningScore,
        uint16 participants
    );
    
    event LeaderboardUpdated(
        address indexed player,
        uint16 newRank,
        uint128 score
    );
    
    // Admin events
    event FeeUpdated(string feeType, uint256 newFee);
    event NetworkConfigured(string networkName, uint256 chainId);
    event RevenueWithdrawn(address indexed owner, uint256 amount);
    event EmergencyAction(string action, address target, uint256 value);
    
    constructor(string memory _networkName) Ownable(msg.sender) {
        networkName = _networkName;
        chainId = block.chainid;
        
        // Network-specific fee configuration
        if (keccak256(bytes(_networkName)) == keccak256(bytes("Celo"))) {
            // Celo: Lower fees due to lower token value
            submissionFee = 0.00001 ether;      // ~$0.0001
            continueFee = 0.0001 ether;         // ~$0.001
            dailyChallengeFee = 0.00005 ether;  // ~$0.0005
        } else {
            // Base/Ethereum: Standard fees
            submissionFee = 0.0001 ether;       // ~$0.01
            continueFee = 0.001 ether;          // ~$0.10
            dailyChallengeFee = 0.0005 ether;   // ~$0.05
        }
        
        emit NetworkConfigured(_networkName, chainId);
    }
    
    /**
     * @dev Submit a game score with enhanced statistics and achievements
     * @param _score Final score achieved
     * @param _level Highest level reached  
     * @param _perfectHits Number of perfect hits (±10ms)
     * @param _totalHits Total number of hits attempted
     * @param _longestStreak Longest perfect hit streak in this game
     * @param _continuesUsed Number of continues purchased during game
     */
    function submitScore(
        uint128 _score,
        uint16 _level,
        uint16 _perfectHits,
        uint16 _totalHits,
        uint16 _longestStreak,
        uint8 _continuesUsed
    ) external payable nonReentrant whenNotPaused {
        
        // Validate inputs
        require(_score > 0, "Score must be greater than 0");
        require(_level > 0, "Level must be greater than 0");
        require(_perfectHits <= _totalHits, "Perfect hits cannot exceed total hits");
        require(_longestStreak <= _perfectHits, "Streak cannot exceed perfect hits");
        
        // Check fee requirement
        if (feeEnabled) {
            require(msg.value >= submissionFee, "Insufficient submission fee");
            totalRevenue += msg.value;
        }
        
        // Determine stage reached
        uint8 stageReached = 1;
        if (_level > STAGE_2_LEVELS) {
            stageReached = 3;
        } else if (_level > STAGE_1_LEVELS) {
            stageReached = 2;
        }
        
        // Initialize new player
        bool isNewPlayer = false;
        if (!playerStats[msg.sender].isActive) {
            players.push(msg.sender);
            totalPlayersCount++;
            isNewPlayer = true;
            
            playerStats[msg.sender] = PlayerStats({
                highScore: 0,
                highestLevel: 0,
                totalGames: 0,
                perfectHits: 0,
                totalHits: 0,
                firstPlayedTimestamp: uint32(block.timestamp),
                lastPlayedTimestamp: uint32(block.timestamp),
                longestStreak: 0,
                stagesCompleted: 0,
                achievements: 0,
                isActive: true
            });
            
            // Award first game achievement
            _unlockAchievement(msg.sender, ACHIEVEMENT_FIRST_GAME);
        }
        
        PlayerStats storage stats = playerStats[msg.sender];
        
        // Update player statistics
        stats.totalGames++;
        stats.perfectHits += _perfectHits;
        stats.totalHits += _totalHits;
        stats.lastPlayedTimestamp = uint32(block.timestamp);
        totalGamesPlayed++;
        
        // Update longest streak
        if (_longestStreak > stats.longestStreak) {
            stats.longestStreak = _longestStreak;
            
            // Check for perfect streak achievement
            if (_longestStreak >= 10 && !_hasAchievement(msg.sender, ACHIEVEMENT_PERFECT_STREAK)) {
                _unlockAchievement(msg.sender, ACHIEVEMENT_PERFECT_STREAK);
            }
        }
        
        // Update highest level
        if (_level > stats.highestLevel) {
            stats.highestLevel = _level;
        }
        
        // Update stages completed and track global stats
        if (stageReached > stats.stagesCompleted) {
            uint8 previousStages = stats.stagesCompleted;
            stats.stagesCompleted = stageReached;
            
            // Update global stage completion counts
            if (stageReached >= 1 && previousStages < 1) {
                stage1Completions++;
                _unlockAchievement(msg.sender, ACHIEVEMENT_STAGE_1);
            }
            if (stageReached >= 2 && previousStages < 2) {
                stage2Completions++;
                _unlockAchievement(msg.sender, ACHIEVEMENT_STAGE_2);
            }
            if (stageReached >= 3 && previousStages < 3) {
                stage3Completions++;
                _unlockAchievement(msg.sender, ACHIEVEMENT_STAGE_3);
            }
            
            emit StageCompleted(msg.sender, stageReached, uint32(block.timestamp), _score);
        }
        
        // Check for new high score
        bool isNewHighScore = false;
        if (_score > stats.highScore) {
            uint128 previousScore = stats.highScore;
            stats.highScore = _score;
            isNewHighScore = true;
            
            // Update leaderboard cache
            _updateLeaderboard(msg.sender, _score);
            
            emit NewHighScore(msg.sender, _score, previousScore, _level);
        }
        
        // Check for veteran achievement
        if (stats.totalGames >= 100 && !_hasAchievement(msg.sender, ACHIEVEMENT_VETERAN)) {
            _unlockAchievement(msg.sender, ACHIEVEMENT_VETERAN);
        }
        
        // Check for perfectionist achievement (90%+ perfect hit ratio)
        if (stats.totalHits >= 100) {
            uint256 perfectRatio = (stats.perfectHits * 100) / stats.totalHits;
            if (perfectRatio >= 90 && !_hasAchievement(msg.sender, ACHIEVEMENT_PERFECTIONIST)) {
                _unlockAchievement(msg.sender, ACHIEVEMENT_PERFECTIONIST);
            }
        }
        
        // Record this game run
        playerRuns[msg.sender].push(GameRun({
            score: _score,
            timestamp: uint32(block.timestamp),
            level: _level,
            perfectHits: _perfectHits,
            totalHits: _totalHits,
            stageReached: stageReached,
            continuesUsed: _continuesUsed
        }));
        
        // Handle daily challenge if active
        uint32 today = uint32(block.timestamp / 86400); // Days since epoch
        if (dailyChallengesEnabled && dailyChallenges[today].active) {
            _submitDailyChallengeScore(today, _score);
        }
        
        emit ScoreSubmitted(msg.sender, _score, _level, _perfectHits, _totalHits, stageReached, _continuesUsed);
    }
    
    /**
     * @dev Purchase a continue to resume game from current level
     * @param _currentLevel Level to continue from
     * @param _currentScore Current score when continuing
     */
    function purchaseContinue(
        uint16 _currentLevel,
        uint128 /* _currentScore */
    ) external payable nonReentrant whenNotPaused {
        require(continueEnabled, "Continue system disabled");
        require(msg.value >= continueFee, "Insufficient continue fee");
        require(_currentLevel > 0 && _currentLevel <= STAGE_3_LEVELS, "Invalid level");
        
        totalRevenue += msg.value;
        
        emit ContinuePurchased(msg.sender, _currentLevel, msg.value, uint32(block.timestamp));
    }
    
    /**
     * @dev Enter daily challenge
     */
    function enterDailyChallenge() external payable nonReentrant whenNotPaused {
        require(dailyChallengesEnabled, "Daily challenges disabled");
        
        uint32 today = uint32(block.timestamp / 86400);
        require(dailyChallenges[today].active, "No active daily challenge");
        require(dailyScores[today][msg.sender] == 0, "Already participated today");
        
        if (dailyChallengeFee > 0) {
            require(msg.value >= dailyChallengeFee, "Insufficient entry fee");
            totalRevenue += msg.value;
        }
        
        // Mark participation
        dailyScores[today][msg.sender] = 1; // Placeholder score
        dailyChallenges[today].participants++;
    }
    
    /**
     * @dev Get player statistics with calculated metrics
     */
    function getPlayerStats(address _player) external view returns (
        PlayerStats memory stats,
        uint256 accuracyPercentage,
        uint256 averageScore,
        uint8[] memory unlockedAchievements
    ) {
        stats = playerStats[_player];
        
        // Calculate accuracy percentage
        if (stats.totalHits > 0) {
            accuracyPercentage = (stats.perfectHits * 100) / stats.totalHits;
        }
        
        // Calculate average score
        if (stats.totalGames > 0) {
            uint256 totalScoreSum = 0;
            GameRun[] memory playerGameRuns = playerRuns[_player];
            for (uint256 i = 0; i < playerGameRuns.length; i++) {
                totalScoreSum += playerGameRuns[i].score;
            }
            averageScore = totalScoreSum / stats.totalGames;
        }
        
        // Get unlocked achievements
        unlockedAchievements = _getPlayerAchievements(_player);
    }
    
    /**
     * @dev Get player's game run history with pagination
     */
    function getPlayerRuns(
        address _player, 
        uint256 _offset, 
        uint256 _limit
    ) external view returns (GameRun[] memory runs, uint256 total) {
        GameRun[] memory allRuns = playerRuns[_player];
        total = allRuns.length;
        
        if (_offset >= total) {
            return (new GameRun[](0), total);
        }
        
        uint256 end = _offset + _limit;
        if (end > total) {
            end = total;
        }
        
        runs = new GameRun[](end - _offset);
        for (uint256 i = _offset; i < end; i++) {
            runs[i - _offset] = allRuns[i];
        }
    }
    
    /**
     * @dev Get all player runs (for backward compatibility)
     */
    function getAllPlayerRuns(address _player) external view returns (GameRun[] memory) {
        return playerRuns[_player];
    }
    
    /**
     * @dev Get top players by high score (gas-optimized with cache)
     */
    function getTopPlayers(uint256 _count) external view returns (
        address[] memory addresses,
        uint128[] memory scores,
        uint16[] memory levels,
        uint8[] memory stages
    ) {
        uint256 count = _count > topPlayers.length ? topPlayers.length : _count;
        
        addresses = new address[](count);
        scores = new uint128[](count);
        levels = new uint16[](count);
        stages = new uint8[](count);
        
        for (uint256 i = 0; i < count; i++) {
            address playerAddr = topPlayers[i];
            PlayerStats memory playerData = playerStats[playerAddr];
            
            addresses[i] = playerAddr;
            scores[i] = playerData.highScore;
            levels[i] = uint16(playerData.highestLevel);
            stages[i] = playerData.stagesCompleted;
        }
    }
    
    /**
     * @dev Get daily challenge leaderboard
     */
    function getDailyChallengeLeaderboard(uint32 /* _date */, uint256 _count) external pure returns (
        address[] memory challengePlayers,
        uint128[] memory challengeScores
    ) {
        // This would need to be implemented with a separate tracking system
        // For now, return empty arrays
        challengePlayers = new address[](_count);
        challengeScores = new uint128[](_count);
    }
    
    /**
     * @dev Get current daily challenge info
     */
    function getCurrentDailyChallenge() external view returns (DailyChallenge memory) {
        uint32 today = uint32(block.timestamp / 86400);
        return dailyChallenges[today];
    }
    
    /**
     * @dev Get players who completed specific stage
     */
    function getStageCompletors(uint8 _stage) external view returns (address[] memory) {
        require(_stage >= 1 && _stage <= 3, "Invalid stage");
        
        // Count qualifying players first
        uint256 count = 0;
        for (uint256 i = 0; i < players.length; i++) {
            if (playerStats[players[i]].stagesCompleted >= _stage) {
                count++;
            }
        }
        
        // Build result array
        address[] memory completors = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < players.length; i++) {
            if (playerStats[players[i]].stagesCompleted >= _stage) {
                completors[index] = players[i];
                index++;
            }
        }
        
        return completors;
    }
    
    /**
     * @dev Get total number of players
     */
    function getTotalPlayers() external view returns (uint256) {
        return players.length;
    }
    
    /**
     * @dev Get comprehensive game statistics (gas-optimized)
     */
    function getGameStats() external view returns (
        uint32 totalPlayers,
        uint32 totalGames,
        uint32 stage1Completors,
        uint32 stage2Completors,
        uint32 stage3Completors,
        uint256 totalRevenue,
        string memory network,
        uint256 chainId
    ) {
        return (
            totalPlayersCount,
            totalGamesPlayed,
            stage1Completions,
            stage2Completions,
            stage3Completions,
            totalRevenue,
            networkName,
            chainId
        );
    }
    
    // Internal helper functions
    
    /**
     * @dev Update leaderboard cache when new high score is achieved
     */
    function _updateLeaderboard(address _player, uint128 _score) internal {
        // Simple insertion into top players array
        bool playerExists = false;
        uint256 insertIndex = topPlayers.length;
        
        // Check if player already exists and find insertion point
        for (uint256 i = 0; i < topPlayers.length; i++) {
            if (topPlayers[i] == _player) {
                playerExists = true;
                // Remove existing entry
                for (uint256 j = i; j < topPlayers.length - 1; j++) {
                    topPlayers[j] = topPlayers[j + 1];
                }
                topPlayers.pop();
                break;
            }
        }
        
        // Find correct insertion point
        for (uint256 i = 0; i < topPlayers.length; i++) {
            if (_score > playerStats[topPlayers[i]].highScore) {
                insertIndex = i;
                break;
            }
        }
        
        // Insert player at correct position
        if (insertIndex < MAX_LEADERBOARD_SIZE) {
            if (topPlayers.length < MAX_LEADERBOARD_SIZE) {
                topPlayers.push(_player);
            }
            
            // Shift elements to make room
            for (uint256 i = topPlayers.length - 1; i > insertIndex; i--) {
                topPlayers[i] = topPlayers[i - 1];
            }
            topPlayers[insertIndex] = _player;
            
            // Check for high scorer achievement (top 10)
            if (insertIndex < 10 && !_hasAchievement(_player, ACHIEVEMENT_HIGH_SCORER)) {
                _unlockAchievement(_player, ACHIEVEMENT_HIGH_SCORER);
            }
            
            emit LeaderboardUpdated(_player, uint16(insertIndex + 1), _score);
        }
    }
    
    /**
     * @dev Unlock achievement for player
     */
    function _unlockAchievement(address _player, uint8 _achievement) internal {
        require(_achievement < 8, "Invalid achievement");
        
        PlayerStats storage stats = playerStats[_player];
        uint8 mask = uint8(1 << _achievement);
        
        if ((stats.achievements & mask) == 0) {
            stats.achievements |= mask;
            emit AchievementUnlocked(_player, _achievement, uint32(block.timestamp));
        }
    }
    
    /**
     * @dev Check if player has specific achievement
     */
    function _hasAchievement(address _player, uint8 _achievement) internal view returns (bool) {
        uint8 mask = uint8(1 << _achievement);
        return (playerStats[_player].achievements & mask) != 0;
    }
    
    /**
     * @dev Get all unlocked achievements for player
     */
    function _getPlayerAchievements(address _player) internal view returns (uint8[] memory) {
        uint8 achievements = playerStats[_player].achievements;
        uint8 count = 0;
        
        // Count unlocked achievements
        for (uint8 i = 0; i < 8; i++) {
            if ((achievements & (1 << i)) != 0) {
                count++;
            }
        }
        
        // Build array of unlocked achievements
        uint8[] memory unlocked = new uint8[](count);
        uint8 index = 0;
        for (uint8 i = 0; i < 8; i++) {
            if ((achievements & (1 << i)) != 0) {
                unlocked[index] = i;
                index++;
            }
        }
        
        return unlocked;
    }
    
    /**
     * @dev Submit score to daily challenge
     */
    function _submitDailyChallengeScore(uint32 _date, uint128 _score) internal {
        if (dailyScores[_date][msg.sender] < _score) {
            dailyScores[_date][msg.sender] = _score;
            
            // Update daily challenge top score
            if (_score > dailyChallenges[_date].topScore) {
                dailyChallenges[_date].topScore = _score;
                dailyChallenges[_date].topPlayer = msg.sender;
            }
        }
    }
    
    // Admin functions
    
    /**
     * @dev Set various fees (owner only)
     */
    function setFees(
        uint256 _submissionFee,
        uint256 _continueFee,
        uint256 _dailyChallengeFee
    ) external onlyOwner {
        submissionFee = _submissionFee;
        continueFee = _continueFee;
        dailyChallengeFee = _dailyChallengeFee;
        
        emit FeeUpdated("submission", _submissionFee);
        emit FeeUpdated("continue", _continueFee);
        emit FeeUpdated("dailyChallenge", _dailyChallengeFee);
    }
    
    /**
     * @dev Toggle various features (owner only)
     */
    function toggleFeatures(
        bool _feeEnabled,
        bool _continueEnabled,
        bool _dailyChallengesEnabled
    ) external onlyOwner {
        feeEnabled = _feeEnabled;
        continueEnabled = _continueEnabled;
        dailyChallengesEnabled = _dailyChallengesEnabled;
    }
    
    /**
     * @dev Start daily challenge (owner only)
     */
    function startDailyChallenge(uint32 _seed) external onlyOwner {
        uint32 today = uint32(block.timestamp / 86400);
        require(!dailyChallenges[today].active, "Challenge already active");
        
        dailyChallenges[today] = DailyChallenge({
            date: today,
            seed: _seed,
            topScore: 0,
            topPlayer: address(0),
            participants: 0,
            active: true
        });
        
        emit DailyChallengeStarted(today, _seed, dailyChallengeFee);
    }
    
    /**
     * @dev End daily challenge and declare winner (owner only)
     */
    function endDailyChallenge(uint32 _date) external onlyOwner {
        require(dailyChallenges[_date].active, "Challenge not active");
        
        dailyChallenges[_date].active = false;
        
        emit DailyChallengeCompleted(
            _date,
            dailyChallenges[_date].topPlayer,
            dailyChallenges[_date].topScore,
            dailyChallenges[_date].participants
        );
    }
    
    /**
     * @dev Pause contract (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Withdraw accumulated revenue (owner only)
     */
    function withdrawRevenue() external onlyOwner nonReentrant {
        uint256 amount = address(this).balance;
        require(amount > 0, "No revenue to withdraw");
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit RevenueWithdrawn(owner(), amount);
    }
    
    /**
     * @dev Emergency function to update player stats (owner only)
     * @dev Only for fixing critical data issues, use with extreme caution
     */
    function emergencyUpdatePlayer(
        address _player,
        uint128 _highScore,
        uint32 _highestLevel,
        uint8 _stagesCompleted
    ) external onlyOwner {
        require(playerStats[_player].isActive, "Player does not exist");
        require(_stagesCompleted <= 3, "Invalid stages completed");
        
        PlayerStats storage stats = playerStats[_player];
        uint128 oldScore = stats.highScore;
        
        stats.highScore = _highScore;
        stats.highestLevel = _highestLevel;
        stats.stagesCompleted = _stagesCompleted;
        
        // Update leaderboard if score changed
        if (_highScore != oldScore) {
            _updateLeaderboard(_player, _highScore);
        }
        
        emit EmergencyAction("updatePlayer", _player, _highScore);
    }
    
    /**
     * @dev Emergency function to rebuild leaderboard cache (owner only)
     */
    function rebuildLeaderboard() external onlyOwner {
        delete topPlayers;
        
        // Rebuild from all players
        for (uint256 i = 0; i < players.length; i++) {
            address player = players[i];
            if (playerStats[player].isActive && playerStats[player].highScore > 0) {
                _updateLeaderboard(player, playerStats[player].highScore);
            }
        }
        
        emit EmergencyAction("rebuildLeaderboard", address(0), topPlayers.length);
    }
    
    /**
     * @dev Get contract info for verification
     */
    function getContractInfo() external view returns (
        string memory name,
        string memory network,
        uint256 chainId,
        uint256 deployedBlock,
        address contractOwner
    ) {
        return (
            "PerfectLeaderboard",
            networkName,
            chainId,
            0, // Would need to be set in constructor
            owner()
        );
    }
    
    /**
     * @dev Check if player has specific achievement (public view)
     */
    function hasAchievement(address _player, uint8 _achievement) external view returns (bool) {
        return _hasAchievement(_player, _achievement);
    }
    
    /**
     * @dev Get all achievements for player (public view)
     */
    function getPlayerAchievements(address _player) external view returns (uint8[] memory) {
        return _getPlayerAchievements(_player);
    }
    
    /**
     * @dev Get player rank in leaderboard
     */
    function getPlayerRank(address _player) external view returns (uint256 rank) {
        for (uint256 i = 0; i < topPlayers.length; i++) {
            if (topPlayers[i] == _player) {
                return i + 1; // 1-based ranking
            }
        }
        return 0; // Not in top players
    }
    
    /**
     * @dev Get network-specific configuration
     */
    function getNetworkConfig() external view returns (
        string memory network,
        uint256 chain,
        uint256 submissionFeeWei,
        uint256 continueFeeWei,
        uint256 dailyChallengeFeeWei,
        bool feesEnabled,
        bool continuesEnabled,
        bool challengesEnabled
    ) {
        return (
            networkName,
            chainId,
            submissionFee,
            continueFee,
            dailyChallengeFee,
            feeEnabled,
            continueEnabled,
            dailyChallengesEnabled
        );
    }
}
