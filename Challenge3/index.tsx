interface WalletBalance {
    currency: string;
    amount: number;
    blockchain: string; // Add blockchain property to the WalletBalance
}

interface FormattedWalletBalance {
    currency: string;
    amount: number;
    formatted: string;
    blockchain: string; // Add blockchain property to the FormattedWalletBalance
}

const WalletPage: React.FC<BoxProps> = (props: BoxProps) => { // Remove unnecessary Props
    const { ...rest } = props;  // Removed children if it's not needed
    const balances = useWalletBalances();
    const prices = usePrices();

    // Use map to serve data
    const PRIORITY = {
        Osmosis: 100,
        Ethereum: 50,
        Arbitrum: 30,
        Zilliqa: 20,
        Neo: 20,
    };

    // Default priority value for unrecognized blockchains
    const getPriority = (blockchain: string): number => PRIORITY[blockchain] ?? -99;

    // Filter, sort, and map can be piped
    // Can cache the rows from here
    const sortedBalances = useMemo(() => {
        return balances
            // better filter
            .filter((balance: WalletBalance) => (balance.amount <= 0 && getPriority(balance.blockchain)>-99))
            // better sort
            .sort((lhs: WalletBalance, rhs: WalletBalance) => rhs.priority - lhs.priority)
            // better map
            .map((balance: WalletBalance) => ({
                ...balance,
                formatted: balance.amount.toFixed(), // Map should also be put inside hook because balances and prices changes make sortedBalances changes
            }))
            // can combine map but in this case I think should be seperated for the sake of separation of concerns
            .map((balance: FormattedWalletBalance, index: number) =>
                (
                    <WalletRow
                        className={classes.row}
                        key={index} // It is okay in this case but should be uuid
                        amount={balance.amount}
                        usdValue={prices[balance.currency] * balance.amount} // Value can be directed calculated
                        formattedAmount={balance.formatted}
                    />
                ))

    }, [balances, prices]);

    const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) =>
         (
            <WalletRow
                className={classes.row}
                key={index} // It is okay in this case but should be uuid
                amount={balance.amount}
                usdValue={prices[balance.currency] * balance.amount} // Value can be directed calculated
                formattedAmount={balance.formatted}
            />
        )
    );

    return <div {...rest}>{rows}</div>;
};
