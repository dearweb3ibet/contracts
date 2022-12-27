// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

library Errors {
    // Common
    string internal constant MESSAGE_VALUE_IS_INCORRECT =
        "Message value is incorrect";
    string internal constant TOKEN_DOES_NOT_EXIST = "Token does not exist";
    string internal constant TOKEN_IS_NON_TRANSFERABLE =
        "Token is non-transferable";

    // Bet contract
    string internal constant FEE_MUST_BE_EQUAL_TO_MESSAGE_VALUE =
        "Fee must equal to message value";
    string internal constant FEE_MUST_BE_GREATER_THAN_ZERO =
        "Fee must be greater than zero";
    string internal constant MAX_PRICE_MUST_BE_GREATER_THAN_MIN_PRICE =
        "Max price must be greater than min price";
    string
        internal constant MUST_BE_MORE_THAN_24_HOURS_BEFORE_TARGET_TIMESTAMP =
        "Must be more than 24 hours before target timestamp";
    string
        internal constant MUST_BE_MORE_THAN_8_HOURS_BEFORE_PARTICIPATION_DEADLINE =
        "Must be more than 8 hours before participation deadline";
    string internal constant SYMBOL_IS_NOT_SUPPORTED =
        "Symbol is not supported";
    string internal constant BET_IS_CLOSED = "Bet is closed";
    string internal constant PARTICIPATION_DEADLINE_IS_EXPIRED =
        "Participation deadline is expired";
    string internal constant SENDER_IS_ALREADY_PARTICIPATING_IN_BET =
        "Sender is already participating in bet";
    string internal constant TARGET_TIMESTAMP_HAS_NOT_COME =
        "Target timestamp has not come";
    string internal constant FAILED_TO_SEND_FEE_TO_CONTEST =
        "Failed to send fee to contest";
    string internal constant FAILED_TO_SEND_FEE_TO_USAGE =
        "Failed to send fee to usage";
    string internal constant FAILED_TO_SEND_FEE_AND_WINNING_TO_WINNERS =
        "Failed to send fee and winning to winners";

    // Bet checker contract
    string internal constant LENGTH_OF_INPUT_ARRAYS_MUST_BE_THE_SAME =
        "Lenghs of input arrays must be the same";
    string internal constant MIN_PRICE_MUST_BE_LOWER_THAN_MAX_PRICE =
        "Min price must be lower than max price";
    string internal constant DAY_START_TIMESTAMP_HAS_NOT_COME =
        "Day start timestamp has not come";
    string internal constant NOT_FOUND_FEED_FOR_SYMBOL =
        "Not found feed for symbol";

    // Contest contract
    string internal constant ONLY_BET_CONTRACT_CAN_BE_SENDER =
        "Only bet contract can be sender";
    string internal constant LAST_WAVE_IS_NOT_CLOSED =
        "Last wave is not closed";
    string internal constant WAVE_IS_NOT_STARTED = "Wave is not started";
    string internal constant WAVE_IS_ALREADY_CLOSED = "Wave is already closed";
    string internal constant WAVE_END_TIMESTAMP_HAS_NOT_COME =
        "Wave end timestamp has not come";
    string internal constant NUMBER_OF_WINNERS_IS_INCORRECT =
        "Number of winners is incorrect";
    string internal constant FAILED_TO_SEND_WINNING = "Failed to send winning";
}
