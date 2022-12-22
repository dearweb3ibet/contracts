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
    string internal constant NOT_FOUND_FEED_FOR_SYMBOL =
        "Not found feed for symbol";

    // Contest contract
    string internal constant LAST_WAVE_IS_NOT_CLOSED =
        "Last wave is not closed";
    string internal constant WAVE_IS_NOT_STARTED = "Wave is not started";
    string internal constant WAVE_IS_ALREADY_CLOSED = "Wave is already closed";
    string internal constant NUMBER_OF_WINNERS_IS_INCORRECT =
        "Number of winners is incorrect";
    string internal constant FAILED_TO_SEND_WINNING = "Failed to send winning";
}