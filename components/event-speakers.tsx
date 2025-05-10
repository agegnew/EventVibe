import Image from "next/image"
import { GlassmorphicCard } from "@/components/ui-elements/glassmorphic-card"

interface Speaker {
  name: string
  role: string
  image: string
}

interface EventSpeakersProps {
  speakers: Speaker[]
}

export function EventSpeakers({ speakers }: EventSpeakersProps) {
  return (
    <GlassmorphicCard className="p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-6">Speakers</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {speakers.map((speaker, index) => (
          <div key={index} className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-purple-100 dark:bg-purple-900/30">
              <Image src={speaker.image || "/placeholder.svg"} alt={speaker.name} fill className="object-cover" />
            </div>
            <h3 className="font-bold">{speaker.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{speaker.role}</p>
          </div>
        ))}
      </div>
    </GlassmorphicCard>
  )
}
