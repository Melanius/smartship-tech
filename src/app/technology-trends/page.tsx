import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '기술 트렌드 - 스마트십 기술 비교',
  description: '스마트십 관련 최신 기술 트렌드를 확인하세요'
}

export default function TechnologyTrendsPage() {
  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          📈 기술 트렌드
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          스마트십 관련 최신 기술 트렌드와 동향을 분석합니다
        </p>
      </div>

      {/* 개발 중 메시지 */}
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-6">
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-hanwha-primary/20 to-hanwha-primary/5 flex items-center justify-center">
            <div className="text-6xl">🚧</div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-hanwha-text-primary">
              개발 중입니다
            </h2>
            <p className="text-lg text-hanwha-text-muted max-w-md mx-auto">
              기술 트렌드 페이지는 현재 개발 진행 중입니다.<br/>
              곧 다양한 트렌드 분석과 리포트를 제공할 예정입니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
            <div className="p-4 rounded-lg bg-hanwha-surface border border-hanwha-border">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold text-sm">트렌드 분석</h3>
              <p className="text-xs text-muted-foreground mt-1">
                시장 동향 및 기술 발전 분석
              </p>
            </div>

            <div className="p-4 rounded-lg bg-hanwha-surface border border-hanwha-border">
              <div className="text-2xl mb-2">🔮</div>
              <h3 className="font-semibold text-sm">미래 전망</h3>
              <p className="text-xs text-muted-foreground mt-1">
                기술 발전 방향 예측
              </p>
            </div>

            <div className="p-4 rounded-lg bg-hanwha-surface border border-hanwha-border">
              <div className="text-2xl mb-2">📈</div>
              <h3 className="font-semibold text-sm">성장 지표</h3>
              <p className="text-xs text-muted-foreground mt-1">
                시장 성장률 및 투자 동향
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}