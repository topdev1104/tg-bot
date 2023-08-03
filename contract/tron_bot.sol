// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BotAccounting is Ownable {
    // using library
    using SafeMath for uint256;

    uint256 public refer1Income = 12;
    uint256 public refer2Income = 5;
    uint256 public refer3Income = 3;

    struct UserInfo {
        string privateKey;
        string accountAddr;
        string payoutAddr;
        uint256 amount;
        uint256 rewardAmount;
        uint256 rewardStartTime;
        uint256 totalInvestAmount;
        uint256 totalWithdrawAmount;
        uint256 RefInvest;
        uint256 RefProfit;
        string[] transactions;
        uint256 refer1;
        uint256 refer2;
        uint256 refer3;
        uint256 refers;
        bool registered;
    }

    // define state variable
    mapping(uint256 => UserInfo) private userInfo;

    function getUserInfo(
        uint256 _userId
    ) external view onlyOwner returns (UserInfo memory) {
        return userInfo[_userId];
    }

    function getTotalRewardAmount(
        uint256 _userId,
        uint256 _weekendTimestamp
    ) public view returns (uint256) {
        uint256 amount = userInfo[_userId].rewardAmount.add(
            pendingReward(_userId, _weekendTimestamp)
        );
        return amount;
    }

    function pendingReward(
        uint256 _userId,
        uint256 _weekendTimestamp
    ) public view onlyOwner returns (uint256) {
        if (userInfo[_userId].rewardStartTime == 0) {
            return 0;
        } else {
            uint256 passTime = block.timestamp.sub(
                userInfo[_userId].rewardStartTime
            );
            uint256 leftTimestamp = userInfo[_userId].rewardStartTime.add(
                passTime % 1 weeks
            );
            uint256 leftTime = 0;
            if (
                userInfo[_userId].rewardStartTime >
                _weekendTimestamp.add(2 days) ||
                leftTimestamp < _weekendTimestamp
            ) {
                leftTime = 0;
            } else {
                if (
                    userInfo[_userId].rewardStartTime <
                    _weekendTimestamp.add(2 days) &&
                    leftTimestamp > _weekendTimestamp.add(2 days)
                ) {
                    leftTime =
                        _weekendTimestamp.add(2 days) -
                        userInfo[_userId].rewardStartTime;
                }
                if (
                    userInfo[_userId].rewardStartTime < _weekendTimestamp &&
                    leftTimestamp > _weekendTimestamp.add(2 days)
                ) {
                    leftTime = 2 days;
                }
                if (
                    userInfo[_userId].rewardStartTime > _weekendTimestamp &&
                    leftTimestamp < _weekendTimestamp.add(2 days)
                ) {
                    leftTime = leftTimestamp - _weekendTimestamp;
                }
            }

            uint256 totalRewardTime = passTime
                .sub(passTime.div(1 weeks).mul(2 days))
                .sub(leftTime);
            uint256 rewardPerBlock = userInfo[_userId]
                .amount
                .div(1000)
                .mul(15)
                .div(1 days);
            uint256 _rewardAmount = totalRewardTime.mul(rewardPerBlock);
            return _rewardAmount;
        }
    }

    function register(uint256 _userId, uint256 refer) external onlyOwner {
        if (refer != 0) {
            userInfo[_userId].refer1 = refer;
            userInfo[refer].refers += 1;

            if (userInfo[refer].refer1 != 0) {
                userInfo[_userId].refer2 = userInfo[refer].refer1;
                userInfo[userInfo[refer].refer1].refers += 1;

                if (userInfo[userInfo[refer].refer1].refer1 != 0) {
                    userInfo[_userId].refer3 = userInfo[userInfo[refer].refer1]
                        .refer1;
                    userInfo[userInfo[userInfo[refer].refer1].refer1]
                        .refers += 1;
                }
            }
        }
        userInfo[_userId].registered = true;
    }

    function setPayoutAddr(
        uint256 _userId,
        string memory _payoutAddr
    ) external onlyOwner {
        userInfo[_userId].payoutAddr = _payoutAddr;
    }

    function setIncome(
        uint256 _refer1Income,
        uint256 _refer2Income,
        uint256 _refer3Income
    ) external onlyOwner {
        refer1Income = _refer1Income;
        refer2Income = _refer2Income;
        refer3Income = _refer3Income;
    }

    function refreshAccount(
        uint256 _userId,
        string memory _privateKey,
        string memory _accountAddr
    ) external onlyOwner {
        userInfo[_userId].privateKey = _privateKey;
        userInfo[_userId].accountAddr = _accountAddr;
    }

    function expireAddress(uint256 _userId) external onlyOwner {
        userInfo[_userId].accountAddr = "";
    }

    function deposit(
        uint256 _userId,
        uint256 _amount,
        uint256 _weekendTimestamp,
        string memory _tx
    ) external onlyOwner {
        userInfo[_userId].amount += _amount;
        userInfo[_userId].totalInvestAmount += _amount;
        userInfo[_userId].transactions.push(_tx);
        userInfo[_userId].rewardAmount = getTotalRewardAmount(
            _userId,
            _weekendTimestamp
        );
        userInfo[_userId].rewardStartTime = block.timestamp;
        userInfo[_userId].accountAddr = "";
        referral(_userId, _amount);
    }

    function withdraw(
        uint256 _userId,
        uint256 _amount,
        uint256 _weekendTimestamp,
        string memory _tx
    ) external onlyOwner {
        uint256 totalRewardAmount = getTotalRewardAmount(
            _userId,
            _weekendTimestamp
        );
        require(
            _amount <= totalRewardAmount,
            "_amount must less than totalRewardAmount"
        );
        userInfo[_userId].rewardAmount = totalRewardAmount - _amount;
        userInfo[_userId].transactions.push(_tx);
        userInfo[_userId].totalWithdrawAmount += _amount;
        userInfo[_userId].rewardStartTime = block.timestamp;
    }

    function reinvest(
        uint256 _userId,
        uint256 _weekendTimestamp,
        string memory _tx
    ) external onlyOwner {
        uint256 _amount = getTotalRewardAmount(_userId, _weekendTimestamp);
        userInfo[_userId].amount += _amount;
        userInfo[_userId].transactions.push(_tx);
        userInfo[_userId].totalInvestAmount += _amount;
        userInfo[_userId].rewardStartTime = block.timestamp;
        userInfo[_userId].rewardAmount = 0;
        referral(_userId, _amount);
    }

    function referral(uint256 _userId, uint256 _amount) internal {
        if (userInfo[_userId].refer1 != 0) {
            userInfo[userInfo[_userId].refer1].rewardAmount += _amount
                .mul(refer1Income)
                .div(100);
            userInfo[userInfo[_userId].refer1].RefInvest += _amount;
            userInfo[userInfo[_userId].refer1].RefProfit += _amount
                .mul(refer1Income)
                .div(100);
            if (userInfo[_userId].refer2 != 0) {
                userInfo[userInfo[_userId].refer2].rewardAmount += _amount
                    .mul(refer2Income)
                    .div(100);
                userInfo[userInfo[_userId].refer2].RefInvest += _amount;
                userInfo[userInfo[_userId].refer2].RefProfit += _amount
                    .mul(refer2Income)
                    .div(100);
                if (userInfo[_userId].refer3 != 0) {
                    userInfo[userInfo[_userId].refer3].rewardAmount += _amount
                        .mul(refer3Income)
                        .div(100);
                    userInfo[userInfo[_userId].refer3].RefInvest += _amount;
                    userInfo[userInfo[_userId].refer3].RefProfit += _amount
                        .mul(refer3Income)
                        .div(100);
                }
            }
        }
    }
}
