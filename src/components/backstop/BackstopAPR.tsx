import { BackstopPoolEst, FixedMath, PoolEstimate } from '@blend-capital/blend-sdk';
import { useBackstop, useBackstopPool, usePool, usePoolMeta, usePoolOracle } from '../../hooks/api';
import { estSingleSidedDeposit } from '../../utils/comet';
import { AprDisplay } from '../common/AprDisplay';
import { PoolComponentProps } from '../common/PoolComponentProps';
import { StackedText } from '../common/StackedText';

export const BackstopAPR: React.FC<PoolComponentProps> = ({ poolId }) => {
  const { data: poolMeta } = usePoolMeta(poolId);
  const { data: pool } = usePool(poolMeta);
  const { data: poolOracle } = usePoolOracle(pool);
  const { data: backstop } = useBackstop(poolMeta?.version);
  const { data: backstopPoolData } = useBackstopPool(poolMeta);

  let estBackstopApr: number | undefined = undefined;
  let backstopEmissionsApr: number | undefined = undefined;

  if (
    pool !== undefined &&
    poolOracle !== undefined &&
    backstop !== undefined &&
    backstopPoolData !== undefined
  ) {
    const poolEst = PoolEstimate.build(pool.reserves, poolOracle);
    const backstopPoolEst = BackstopPoolEst.build(
      backstop.backstopToken,
      backstopPoolData.poolBalance
    );
    estBackstopApr =
      (FixedMath.toFloat(BigInt(pool.metadata.backstopRate), 7) *
        poolEst.avgBorrowApr *
        poolEst.totalBorrowed) /
      backstopPoolEst.totalSpotValue;
    backstopEmissionsApr = estSingleSidedDeposit(
      'blnd',
      backstop.backstopToken,
      FixedMath.toFixed(backstopPoolData.emissionPerYearPerBackstopToken(), 7)
    );
  }

  return (
    <StackedText
      title="Backstop APR"
      text={
        estBackstopApr !== undefined ? (
          <AprDisplay
            assetSymbol={'BLND-USDC LP'}
            assetApr={estBackstopApr}
            emissionSymbol={'BLND-USDC LP'}
            emissionApr={backstopEmissionsApr}
            isSupply={true}
            direction={'horizontal'}
          />
        ) : (
          ''
        )
      }
      sx={{ width: '100%', padding: '6px' }}
      tooltip="Estimated APR based on pool interest sharing."
    ></StackedText>
  );
};
