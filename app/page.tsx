"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Sparkles } from "lucide-react"

const initialRestaurants = [
  "장수본가해장국",
  "샐러드박스",
  "고기를 굽다",
  "김밥나라",
  "먹보집",
  "이여사나무김밥",
  "자연식당(구도로)",
  "전주콩나루콩나물국밥",
  "에콥샐러드",
  "더빨강",
  "오리랑돼지랑(할매오삼구이)",
  "삼다옥1947",
  "긴자료코",
  "마루돈가",
  "엘에이북창동순두부",
  "밥식구",
  "할매순대국",
  "단청김치찜김치찌개",
  "제주몬트락",
  "담소소사골순대육개장",
  "깡우동",
  "바다애",
  "매취랑",
  "장홍규중화요리",
  "김영희동태찜&코다리냉면",
  "써브웨이",
  "정통마라탕",
  "맘스터치",
  "맘맘테이블",
  "정샤브",
  "메콩타이",
  "서울미트볼",
  "단가마감자탕",
  "홍콩반점",
  "옥된장",
  "산골밥상족발",
  "인사동",
  "청년다방",
  "후토루",
  "하오마라",
  "월선네",
  "봉추찜닭",
  "샐러디",
  "본죽&비빔밥",
  "진짜장짬뽕",
  "전주현대옥",
]

type AnimationState = "idle" | "spinning" | "result"

export default function LunchPicker() {
  const [restaurants, setRestaurants] = useState(initialRestaurants)
  const [animationState, setAnimationState] = useState<AnimationState>("idle")
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("")
  const [newRestaurant, setNewRestaurant] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([])

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()

  const findCenterRestaurant = () => {
    const container = scrollContainerRef.current
    if (!container) return null

    // 컨테이너의 중앙 위치 계산
    const containerRect = container.getBoundingClientRect()
    const centerX = containerRect.left + containerRect.width / 2

    // 모든 카드 요소들을 찾아서 중앙선에 가장 가까운 것 찾기
    const cards = container.querySelectorAll("[data-restaurant]")
    let closestCard = null
    let minDistance = Number.POSITIVE_INFINITY

    cards.forEach((card) => {
      const cardRect = card.getBoundingClientRect()
      const cardCenterX = cardRect.left + cardRect.width / 2
      const distance = Math.abs(centerX - cardCenterX)

      if (distance < minDistance) {
        minDistance = distance
        closestCard = card
      }
    })

    if (closestCard) {
      return closestCard.getAttribute("data-restaurant")
    }

    return null
  }

  const startSpin = () => {
    if (restaurants.length === 0) return

    setAnimationState("spinning")
    setSelectedRestaurant("")
    setParticles([])

    const container = scrollContainerRef.current
    if (!container) return

    // 애니메이션 설정 - 9초 동안 지속
    let currentSpeed = 80 // 초기 속도
    const animationDuration = 9000 // 9초
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = elapsed / animationDuration

      if (progress < 1) {
        // 9초 동안 점진적으로 감속 (순방향으로만) - 마지막에 거의 0에 수렴
        currentSpeed = 80 * Math.pow(1 - progress, 4) // exponential decay로 마지막에 거의 0에 수렴

        // 현재 스크롤 위치에서 순방향으로만 이동
        const currentScroll = container.scrollLeft
        const newScroll = currentScroll + currentSpeed
        const maxScroll = container.scrollWidth - container.clientWidth

        // 스크롤이 끝에 도달하면 처음으로 돌아가기 (seamless scrolling)
        if (newScroll >= maxScroll) {
          container.scrollLeft = newScroll - maxScroll
        } else {
          container.scrollLeft = newScroll
        }

        animationRef.current = requestAnimationFrame(animate)
      } else {
        // 애니메이션 완료 - 실제 DOM 위치를 기반으로 중앙에 있는 레스토랑 찾기
        const centerRestaurant = findCenterRestaurant()

        if (centerRestaurant) {
          setSelectedRestaurant(centerRestaurant)
          setAnimationState("result")
          createParticles()
        }
      }
    }

    animate()
  }

  const createParticles = () => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
    }))
    setParticles(newParticles)

    setTimeout(() => setParticles([]), 3000)
  }

  const addRestaurant = () => {
    if (newRestaurant.trim() && !restaurants.includes(newRestaurant.trim())) {
      setRestaurants([...restaurants, newRestaurant.trim()])
      setNewRestaurant("")
      setIsAddModalOpen(false)
    }
  }

  const deleteRestaurant = (restaurant: string) => {
    setRestaurants(restaurants.filter((r) => r !== restaurant))
  }

  const resetSpin = () => {
    setAnimationState("idle")
    setSelectedRestaurant("")
    setParticles([])
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_49%,rgba(59,130,246,0.05)_50%,transparent_51%)] bg-[length:20px_20px]" />
      </div>

      {/* Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            animationDuration: "1s",
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            점심 메뉴 뽑기
          </h1>
          <p className="text-xl text-gray-300">Dareesoft 페이코 식당 선택기</p>
        </div>

        {/* Case Opening Area */}
        <div className="mb-12">
          <Card className="bg-gray-800/50 border-gray-700 p-8 backdrop-blur-sm">
            <div className="relative">
              {/* Selection Guide Line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 to-orange-500 transform -translate-x-1/2 z-10 shadow-lg shadow-yellow-400/50" />

              {/* Restaurant Cards Container */}
              <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-hidden py-8 px-4"
                style={{ scrollBehavior: animationState === "spinning" ? "auto" : "smooth" }}
              >
                {/* Duplicate restaurants for seamless scrolling */}
                {[...restaurants, ...restaurants, ...restaurants].map((restaurant, index) => (
                  <div
                    key={`${restaurant}-${index}`}
                    data-restaurant={restaurant}
                    className={`flex-shrink-0 w-48 h-32 ${
                      selectedRestaurant === restaurant && animationState === "result"
                        ? "scale-110 shadow-2xl shadow-yellow-400/50"
                        : ""
                    } transition-all duration-300`}
                  >
                    <Card
                      className={`w-full h-full flex items-center justify-center text-center p-4 ${
                        selectedRestaurant === restaurant && animationState === "result"
                          ? "bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border-yellow-400 shadow-lg shadow-yellow-400/30"
                          : "bg-gray-700/50 border-gray-600 hover:bg-gray-600/50"
                      } transition-all duration-300`}
                    >
                      <span
                        className={`font-semibold ${
                          selectedRestaurant === restaurant && animationState === "result"
                            ? "text-yellow-400 text-lg"
                            : "text-white"
                        }`}
                      >
                        {restaurant}
                      </span>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Control Buttons */}
        <div className="text-center mb-8">
          {animationState === "idle" && (
            <Button
              onClick={startSpin}
              disabled={restaurants.length === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 text-xl rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Sparkles className="mr-2 h-6 w-6" />
              뽑기 시작
            </Button>
          )}

          {animationState === "spinning" && (
            <Button disabled className="bg-gray-600 text-white font-bold py-4 px-8 text-xl rounded-lg opacity-75">
              뽑는 중...
            </Button>
          )}

          {animationState === "result" && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-yellow-400 mb-2">🎉 선택된 레스토랑 🎉</h2>
                <p className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  {selectedRestaurant}
                </p>
              </div>
              <Button
                onClick={resetSpin}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 px-8 text-xl rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                다시 뽑기
              </Button>
            </div>
          )}
        </div>

        {/* Restaurant Management */}
        <div className="flex justify-center gap-4">
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700 bg-transparent">
                <Plus className="mr-2 h-4 w-4" />
                레스토랑 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>새 레스토랑 추가</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="restaurant-name">레스토랑 이름</Label>
                  <Input
                    id="restaurant-name"
                    value={newRestaurant}
                    onChange={(e) => setNewRestaurant(e.target.value)}
                    placeholder="레스토랑 이름을 입력하세요"
                    className="bg-gray-700 border-gray-600 text-white"
                    onKeyPress={(e) => e.key === "Enter" && addRestaurant()}
                  />
                </div>
                <Button onClick={addRestaurant} className="w-full">
                  추가
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isManageModalOpen} onOpenChange={setIsManageModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700 bg-transparent">
                레스토랑 관리
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white max-h-96 overflow-y-auto">
              <DialogHeader>
                <DialogTitle>레스토랑 목록 관리</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                {restaurants.map((restaurant) => (
                  <div key={restaurant} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                    <span>{restaurant}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRestaurant(restaurant)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {restaurants.length === 0 && (
                  <p className="text-gray-400 text-center py-4">등록된 레스토랑이 없습니다.</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
