/**
 * 공통 에러 처리 유틸리티
 * Supabase 에러 메시지를 한글로 번역하고 사용자 친화적인 메시지 제공
 */

export interface ErrorResult {
  success: false
  error: string
  details?: unknown
}

export interface SuccessResult<T> {
  success: true
  data: T
}

export type Result<T> = SuccessResult<T> | ErrorResult

/**
 * Supabase 에러를 한글 메시지로 변환
 */
export function translateSupabaseError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const supabaseError = error as { code: string; message: string }

    switch (supabaseError.code) {
      case '23505':
        return '이미 존재하는 데이터입니다.'
      case '23503':
        return '참조된 데이터를 찾을 수 없습니다.'
      case '23502':
        return '필수 입력 항목이 누락되었습니다.'
      case '42P01':
        return '데이터베이스 테이블을 찾을 수 없습니다.'
      case 'PGRST116':
        return '데이터를 찾을 수 없습니다.'
      default:
        return supabaseError.message || '알 수 없는 오류가 발생했습니다.'
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return '알 수 없는 오류가 발생했습니다.'
}

/**
 * 비동기 작업을 안전하게 실행하고 Result 타입 반환
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  errorMessage?: string
): Promise<Result<T>> {
  try {
    const data = await operation()
    return { success: true, data }
  } catch (error) {
    console.error(errorMessage || 'Operation failed:', error)
    return {
      success: false,
      error: errorMessage || translateSupabaseError(error),
      details: error
    }
  }
}

/**
 * 여러 비동기 작업을 병렬 실행하고 부분 실패 허용
 * Promise.allSettled를 사용하여 일부 실패해도 성공한 결과 반환
 */
export async function safeParallel<T>(
  operations: Array<() => Promise<T>>,
  operationNames?: string[]
): Promise<{
  results: T[]
  errors: Array<{ index: number; name?: string; error: string }>
}> {
  const settledResults = await Promise.allSettled(
    operations.map(op => op())
  )

  const results: T[] = []
  const errors: Array<{ index: number; name?: string; error: string }> = []

  settledResults.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      results.push(result.value)
    } else {
      errors.push({
        index,
        name: operationNames?.[index],
        error: translateSupabaseError(result.reason)
      })
    }
  })

  return { results, errors }
}

/**
 * Supabase 쿼리 실행 헬퍼
 */
export async function executeSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: unknown }>,
  errorMessage?: string
): Promise<Result<T>> {
  try {
    const { data, error } = await queryFn()

    if (error) {
      return {
        success: false,
        error: errorMessage || translateSupabaseError(error),
        details: error
      }
    }

    if (data === null) {
      return {
        success: false,
        error: '데이터를 찾을 수 없습니다.'
      }
    }

    return { success: true, data }
  } catch (error) {
    console.error(errorMessage || 'Supabase query failed:', error)
    return {
      success: false,
      error: errorMessage || translateSupabaseError(error),
      details: error
    }
  }
}
