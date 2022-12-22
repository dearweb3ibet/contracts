// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV2V3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IBetChecker.sol";
import "./libraries/Constants.sol";
import "./libraries/Errors.sol";

/**
 * Contract to check the success of failure of a bet using price feeds from Chainlink.
 *
 * TODO: Make contract upgradeable and add initializer
 */
contract BetChecker is IBetChecker, Ownable {
    mapping(string => address) private _feedAddresses;

    function setFeedAddresses(
        string[] memory feedSymbols,
        address[] memory feedAddresses
    ) public onlyOwner {
        require(
            feedSymbols.length == feedAddresses.length,
            Errors.LENGTH_OF_INPUT_ARRAYS_MUST_BE_THE_SAME
        );
        for (uint i = 0; i < feedSymbols.length; i++) {
            _feedAddresses[feedSymbols[i]] = feedAddresses[i];
        }
    }

    function setFeedAddress(
        string memory feedSymbol,
        address feedAddress
    ) public onlyOwner {
        _feedAddresses[feedSymbol] = feedAddress;
    }

    function getFeedAddress(
        string memory feedSymbol
    ) external view returns (address) {
        return _feedAddresses[feedSymbol];
    }

    function getPhaseForTimestamp(
        AggregatorV2V3Interface feed,
        uint256 targetTime
    ) public view returns (uint80, uint256, uint80) {
        uint16 currentPhase = uint16(feed.latestRound() >> 64);
        uint80 firstRoundOfCurrentPhase = (uint80(currentPhase) << 64) + 1;

        for (uint16 phase = currentPhase; phase >= 1; phase--) {
            uint80 firstRoundOfPhase = (uint80(phase) << 64) + 1;
            uint256 firstTimeOfPhase = feed.getTimestamp(firstRoundOfPhase);

            if (targetTime > firstTimeOfPhase) {
                return (
                    firstRoundOfPhase,
                    firstTimeOfPhase,
                    firstRoundOfCurrentPhase
                );
            }
        }
        return (0, 0, firstRoundOfCurrentPhase);
    }

    function guessSearchRoundsForTimestamp(
        AggregatorV2V3Interface feed,
        uint256 fromTime,
        uint80 daysToFetch
    )
        public
        view
        returns (uint80 firstRoundToSearch, uint80 numRoundsToSearch)
    {
        uint256 toTime = fromTime + Constants.SECONDS_PER_DAY * daysToFetch;

        (
            uint80 lhRound,
            uint256 lhTime,
            uint80 firstRoundOfCurrentPhase
        ) = getPhaseForTimestamp(feed, fromTime);

        uint80 rhRound;
        uint256 rhTime;
        if (lhRound == 0) {
            // Date is too far in the past, no data available
            return (0, 0);
        } else if (lhRound == firstRoundOfCurrentPhase) {
            (rhRound, , rhTime, , ) = feed.latestRoundData();
        } else {
            // No good way to get last round of phase from Chainlink feed, so our binary search function will have to use trial & error.
            // Use 2**16 == 65536 as a upper bound on the number of rounds to search in a single Chainlink phase.

            rhRound = lhRound + 2 ** 16;
            rhTime = 0;
        }

        uint80 fromRound = binarySearchForTimestamp(
            feed,
            fromTime,
            lhRound,
            lhTime,
            rhRound,
            rhTime
        );
        uint80 toRound = binarySearchForTimestamp(
            feed,
            toTime,
            fromRound,
            fromTime,
            rhRound,
            rhTime
        );
        return (fromRound, toRound - fromRound);
    }

    function binarySearchForTimestamp(
        AggregatorV2V3Interface feed,
        uint256 targetTime,
        uint80 lhRound,
        uint256 lhTime,
        uint80 rhRound,
        uint256 rhTime
    ) public view returns (uint80 targetRound) {
        if (lhTime > targetTime) return 0;

        uint80 guessRound = rhRound;
        while (rhRound - lhRound > 1) {
            guessRound = uint80(int80(lhRound) + int80(rhRound - lhRound) / 2);
            uint256 guessTime = feed.getTimestamp(uint256(guessRound));
            if (guessTime == 0 || guessTime > targetTime) {
                (rhRound, rhTime) = (guessRound, guessTime);
            } else if (guessTime < targetTime) {
                (lhRound, lhTime) = (guessRound, guessTime);
            }
        }
        return guessRound;
    }

    function roundIdsToSearch(
        AggregatorV2V3Interface feed,
        uint256 fromTimestamp,
        uint80 daysToFetch,
        uint dataPointsToFetchPerDay
    ) public view returns (uint80[] memory) {
        (
            uint80 startingId,
            uint80 numRoundsToSearch
        ) = guessSearchRoundsForTimestamp(feed, fromTimestamp, daysToFetch);

        uint80 fetchFilter = uint80(
            numRoundsToSearch / (daysToFetch * dataPointsToFetchPerDay)
        );
        if (fetchFilter < 1) {
            fetchFilter = 1;
        }
        uint80[] memory roundIds = new uint80[](
            numRoundsToSearch / fetchFilter
        );

        // Snap startingId to a round that is a multiple of fetchFilter. This prevents the perpetual jam from changing more often than
        // necessary, and keeps it aligned with the daily prints.
        startingId -= startingId % fetchFilter;

        for (uint80 i = 0; i < roundIds.length; i++) {
            roundIds[i] = startingId + i * fetchFilter;
        }
        return roundIds;
    }

    function fetchPriceData(
        AggregatorV2V3Interface feed,
        uint256 fromTimestamp,
        uint80 daysToFetch,
        uint dataPointsToFetchPerDay
    ) public view returns (int[] memory) {
        uint80[] memory roundIds = roundIdsToSearch(
            feed,
            fromTimestamp,
            daysToFetch,
            dataPointsToFetchPerDay
        );
        uint dataPointsToReturn;
        if (roundIds.length == 0) {
            dataPointsToReturn = 0;
        } else {
            dataPointsToReturn = dataPointsToFetchPerDay * daysToFetch; // Number of data points to return
        }
        uint secondsBetweenDataPoints = Constants.SECONDS_PER_DAY /
            dataPointsToFetchPerDay;

        int[] memory prices = new int[](dataPointsToReturn);

        uint80 latestRoundId = uint80(feed.latestRound());
        for (uint80 i = 0; i < roundIds.length; i++) {
            if (roundIds[i] != 0 && roundIds[i] < latestRoundId) {
                (, int price, uint timestamp, , ) = feed.getRoundData(
                    roundIds[i]
                );

                if (timestamp >= fromTimestamp) {
                    uint segmentsSinceStart = (timestamp - fromTimestamp) /
                        secondsBetweenDataPoints;
                    if (segmentsSinceStart < prices.length) {
                        prices[segmentsSinceStart] = price;
                    }
                }
            }
        }

        return prices;
    }

    function fetchPriceDataForFeed(
        address feedAddress,
        uint fromTimestamp,
        uint80 daysToFetch,
        uint dataPointsToFetchPerDay
    ) public view returns (int[] memory) {
        AggregatorV2V3Interface feed = AggregatorV2V3Interface(feedAddress);

        require(fromTimestamp > 0);

        int256[] memory prices = fetchPriceData(
            feed,
            fromTimestamp,
            daysToFetch,
            dataPointsToFetchPerDay
        );
        return prices;
    }

    function getMinMaxPrices(
        address feedAddress,
        uint dayStartTimestamp
    ) public view returns (int, int) {
        // Init params
        uint80 daysToFetch = 1;
        uint dataPointsToFetchPerDay = 256;
        // Load day prices
        int[] memory prices = fetchPriceDataForFeed(
            feedAddress,
            dayStartTimestamp,
            daysToFetch,
            dataPointsToFetchPerDay
        );
        // Fin min and max prices
        int minPrice = 2 ** 255 - 1;
        int maxPrice = 0;
        for (uint80 i = 0; i < prices.length; i++) {
            int price = prices[i];
            if (price != 0 && price < minPrice) {
                minPrice = price;
            }
            if (price != 0 && price > maxPrice) {
                maxPrice = price;
            }
        }
        // Return
        return (minPrice, maxPrice);
    }

    // TODO: Check that day has passed
    function isPriceExist(
        string memory symbol,
        uint dayStartTimestamp,
        int minPrice,
        int maxPrice
    ) external view returns (bool, int, int) {
        // Check input data
        require(
            minPrice <= maxPrice,
            Errors.MIN_PRICE_MUST_BE_LOWER_THAN_MAX_PRICE
        );
        require(
            _feedAddresses[symbol] != address(0),
            Errors.NOT_FOUND_FEED_FOR_SYMBOL
        );
        // Get day min and max prices
        (int dayMinPrice, int dayMaxPrice) = getMinMaxPrices(
            _feedAddresses[symbol],
            dayStartTimestamp
        );
        // Compare input prices with day prices
        bool result = false;
        int fixedMinPrice = minPrice * 10 ** 8;
        int fixedMaxPrice = maxPrice * 10 ** 8;
        if (fixedMinPrice <= dayMinPrice && fixedMaxPrice >= dayMinPrice) {
            result = true;
        }
        if (fixedMinPrice >= dayMinPrice && fixedMaxPrice <= dayMaxPrice) {
            result = true;
        }
        if (fixedMinPrice <= dayMaxPrice && fixedMaxPrice >= dayMaxPrice) {
            result = true;
        }
        // Return
        return (result, dayMinPrice, dayMaxPrice);
    }
}
