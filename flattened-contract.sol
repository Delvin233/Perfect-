
WARNING: You are using Node.js 25.2.1 which is not supported by Hardhat.
Please upgrade to 22.10.0 or a later LTS version (even major version number)

[dotenv@17.2.3] injecting env (11) from .env -- tip: 🔐 prevent committing .env to code: https://dotenvx.com/precommit
// Sources flattened with hardhat v3.1.0 https://hardhat.org

// SPDX-License-Identifier: MIT

// File npm/@openzeppelin/contracts@5.4.0/utils/Context.sol

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

pragma solidity ^0.8.20;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}


// File npm/@openzeppelin/contracts@5.4.0/access/Ownable.sol

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// File npm/@openzeppelin/contracts@5.4.0/utils/Pausable.sol

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.3.0) (utils/Pausable.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module which allows children to implement an emergency stop
 * mechanism that can be triggered by an authorized account.
 *
 * This module is used through inheritance. It will make available the
 * modifiers `whenNotPaused` and `whenPaused`, which can be applied to
 * the functions of your contract. Note that they will not be pausable by
 * simply including this module, only once the modifiers are put in place.
 */
abstract contract Pausable is Context {
    bool private _paused;

    /**
     * @dev Emitted when the pause is triggered by `account`.
     */
    event Paused(address account);

    /**
     * @dev Emitted when the pause is lifted by `account`.
     */
    event Unpaused(address account);

    /**
     * @dev The operation failed because the contract is paused.
     */
    error EnforcedPause();

    /**
     * @dev The operation failed because the contract is not paused.
     */
    error ExpectedPause();

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    modifier whenNotPaused() {
        _requireNotPaused();
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    modifier whenPaused() {
        _requirePaused();
        _;
    }

    /**
     * @dev Returns true if the contract is paused, and false otherwise.
     */
    function paused() public view virtual returns (bool) {
        return _paused;
    }

    /**
     * @dev Throws if the contract is paused.
     */
    function _requireNotPaused() internal view virtual {
        if (paused()) {
            revert EnforcedPause();
        }
    }

    /**
     * @dev Throws if the contract is not paused.
     */
    function _requirePaused() internal view virtual {
        if (!paused()) {
            revert ExpectedPause();
        }
    }

    /**
     * @dev Triggers stopped state.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(_msgSender());
    }

    /**
     * @dev Returns to normal state.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(_msgSender());
    }
}


// File npm/@openzeppelin/contracts@5.4.0/utils/ReentrancyGuard.sol

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (utils/ReentrancyGuard.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    uint256 private _status;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _status = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        if (_status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        _status = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == ENTERED;
    }
}


// File contracts/PerfectLeaderboard.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;



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
     */
    function purchaseContinue(
        uint16 _currentLevel
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
        uint256 totalRevenueAmount,
        string memory network,
        uint256 networkChainId
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
        uint256 contractChainId,
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
        uint256 networkChain,
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

