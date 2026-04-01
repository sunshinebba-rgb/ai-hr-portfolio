import { inject, type InjectionKey } from 'vue'
import { useTalentReviewApp } from './useTalentReviewApp'

export type TalentReviewApi = ReturnType<typeof useTalentReviewApp>

export const talentReviewKey: InjectionKey<TalentReviewApi> = Symbol('talentReview')

export function useTalentReview(): TalentReviewApi {
  const ctx = inject(talentReviewKey)
  if (!ctx) {
    throw new Error('useTalentReview() must be used within TalentReviewApp')
  }
  return ctx
}
