import { ProjectMeta, Scene, SceneCostDetails } from '../modules/eigu-file/eigu-types';
import { MainLogger } from '../utils/logger.utils';

export interface GuardrailCheckResult {
  allowed: boolean;
  warningNeeded: boolean;
  limitExceeded: boolean;
  warningMessage?: string;
  errorMessage?: string;
  currentCost: number;
  newJobEstimate: number;
  projectedTotal: number;
  budgetLimit: number;
  perJobLimit: number;
  cheaperProviderSuggestion?: {
    providerId: string;
    providerName: string;
    estimatedCost: number;
    savings: number;
  };
}

export class CostGuardrailService {
  private static instance: CostGuardrailService;

  public static getInstance(): CostGuardrailService {
    if (!CostGuardrailService.instance) {
      CostGuardrailService.instance = new CostGuardrailService();
    }
    return CostGuardrailService.instance;
  }

  /**
   * Tính toán chi phí ước tính dựa trên Provider, Model, Voice & Composition
   */
  public estimateSceneCost(scene: Partial<Scene>, provider: string = 'fal', model: string = 'veo3'): SceneCostDetails {
    const providerLower = (provider || 'fal').toLowerCase();
    
    // 1. Provider Cost Rate
    let providerCost = 0.08;
    if (providerLower.includes('veo')) {
      providerCost = 0.15;
    } else if (providerLower.includes('runway')) {
      providerCost = 0.12;
    } else if (providerLower.includes('kling')) {
      providerCost = 0.09;
    }

    // 2. Model Cost Rate
    const modelCost = model.includes('3') ? 0.05 : 0.03;

    // 3. Voice Cost Rate (nếu có voiceId hoặc voiceLine)
    const voiceCost = (scene.voiceId || scene.voiceLine) ? 0.03 : 0.00;

    // 4. Composition Cost Rate
    const compositionCost = 0.01;

    const estimatedCost = parseFloat((providerCost + modelCost + voiceCost + compositionCost).toFixed(2));

    return {
      providerCost,
      modelCost,
      voiceCost,
      compositionCost,
      estimatedCost,
      actualCost: estimatedCost
    };
  }

  /**
   * Kiểm tra hạn mức chi phí (Guardrail Check) trước khi Submit Render Job (20-Cost-Management.md)
   */
  public checkGuardrail(
    projectMeta: Partial<ProjectMeta> = {},
    currentProjectCost: number = 0,
    scene: Partial<Scene> = {},
    provider: string = 'fal',
    model: string = 'veo3',
    userCreditBalance?: number
  ): GuardrailCheckResult {
    const budgetLimit = projectMeta.budgetLimit || 10.0;
    const perJobLimit = projectMeta.perJobLimit || 2.0;

    const costDetails = this.estimateSceneCost(scene, provider, model);
    const newJobEstimate = costDetails.estimatedCost;
    const projectedTotal = parseFloat((currentProjectCost + newJobEstimate).toFixed(2));

    let allowed = true;
    let warningNeeded = false;
    let limitExceeded = false;
    let warningMessage: string | undefined;
    let errorMessage: string | undefined;

    // 1. Dual-Layer Check: Real User Credit Balance Check
    if (userCreditBalance !== undefined && userCreditBalance < newJobEstimate) {
      allowed = false;
      limitExceeded = true;
      errorMessage = `Lệnh Render bị CHẶN: Số dư Credit trong tài khoản của bạn (${userCreditBalance} Credit) không đủ cho chi phí render ước tính (${newJobEstimate} Credit). Vui lòng nạp thêm Credit!`;
      MainLogger.warn(`[Cost Guardrail] Blocked render job for insufficient user credit (${userCreditBalance} < ${newJobEstimate})`, {
        correlationId: 'CREDIT_BLOCKED'
      });
      return {
        allowed, warningNeeded: true, limitExceeded, errorMessage, warningMessage: errorMessage,
        currentCost: currentProjectCost, newJobEstimate, projectedTotal, budgetLimit, perJobLimit
      };
    }

    // 2. Check per-job limit
    if (newJobEstimate > perJobLimit) {
      warningNeeded = true;
      warningMessage = `Chi phí ước tính của phân cảnh ($${newJobEstimate.toFixed(2)}) vượt quá hạn mức mỗi Job ($${perJobLimit.toFixed(2)}).`;
    }

    // 3. Check budget limit
    if (projectedTotal > budgetLimit) {
      warningNeeded = true;
      warningMessage = `Tổng chi phí dự án dự kiến ($${projectedTotal.toFixed(2)}) sẽ vượt quá ngân sách cho phép ($${budgetLimit.toFixed(2)}).`;
    }

    // 4. Hard limit check (vượt 150% ngân sách cho phép)
    if (projectedTotal > budgetLimit * 1.5) {
      allowed = false;
      limitExceeded = true;
      errorMessage = `Lệnh Render bị CHẶN: Tổng chi phí dự kiến ($${projectedTotal.toFixed(2)}) đã vượt quá giới hạn cứng ($${(budgetLimit * 1.5).toFixed(2)}).`;
      MainLogger.warn(`[Cost Guardrail] Blocked render job for exceeding hard budget limit ($${projectedTotal} > $${budgetLimit * 1.5})`, {
        correlationId: 'COST_BLOCKED'
      });
    }

    // Cheaper provider fallback suggestion
    let cheaperProviderSuggestion;
    if (warningNeeded && (provider.includes('veo') || provider.includes('runway'))) {
      const cheaperCostDetails = this.estimateSceneCost(scene, 'fal', 'kling');
      const savings = parseFloat((newJobEstimate - cheaperCostDetails.estimatedCost).toFixed(2));
      if (savings > 0) {
        cheaperProviderSuggestion = {
          providerId: 'fal',
          providerName: 'Fal.ai (Fast & Economical)',
          estimatedCost: cheaperCostDetails.estimatedCost,
          savings
        };
      }
    }

    return {
      allowed,
      warningNeeded,
      limitExceeded,
      warningMessage,
      errorMessage,
      currentCost: currentProjectCost,
      newJobEstimate,
      projectedTotal,
      budgetLimit,
      perJobLimit,
      cheaperProviderSuggestion
    };
  }
}
