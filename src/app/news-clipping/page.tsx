import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '뉴스 클리핑 - 스마트십 기술 비교',
  description: '스마트십 관련 최신 뉴스와 동향을 확인하세요'
}

export default function NewsClippingPage() {
  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          📰 뉴스 클리핑
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          스마트십 관련 최신 뉴스와 업계 동향을 모아보세요
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
              뉴스 클리핑 페이지는 현재 개발 진행 중입니다.<br/>
              곧 다양한 뉴스와 업계 동향을 제공할 예정입니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
            <div className="p-4 rounded-lg bg-hanwha-surface border border-hanwha-border">
              <div className="text-2xl mb-2">📱</div>
              <h3 className="font-semibold text-sm">실시간 뉴스</h3>
              <p className="text-xs text-muted-foreground mt-1">
                최신 스마트십 관련 뉴스
              </p>
            </div>

            <div className="p-4 rounded-lg bg-hanwha-surface border border-hanwha-border">
              <div className="text-2xl mb-2">🏭</div>
              <h3 className="font-semibold text-sm">업계 동향</h3>
              <p className="text-xs text-muted-foreground mt-1">
                조선업계 주요 동향
              </p>
            </div>

            <div className="p-4 rounded-lg bg-hanwha-surface border border-hanwha-border">
              <div className="text-2xl mb-2">🔍</div>
              <h3 className="font-semibold text-sm">심층 분석</h3>
              <p className="text-xs text-muted-foreground mt-1">
                전문가 분석 및 리포트
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-hanwha-primary/5 to-hanwha-primary/10 border border-hanwha-primary/20">
            <h3 className="text-lg font-semibold mb-2 text-hanwha-text-primary">
              📬 출시 알림 받기
            </h3>
            <p className="text-sm text-hanwha-text-muted mb-4">
              뉴스 클리핑 기능이 출시되면 알림을 받아보세요
            </p>
            <button className="px-6 py-2 bg-hanwha-primary text-white rounded-lg hover:bg-hanwha-primary/90 transition-colors text-sm font-medium">
              알림 신청 (준비 중)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}