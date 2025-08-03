import { ReactNode } from 'react';

interface FeatureCardProps {
    icon: ReactNode;
    title: string;
    description: string;
    bgColor: string;
}

export default function FeatureCard({ icon, title, description, bgColor }: FeatureCardProps) {
    return (
        <div className={`${bgColor} border-4 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)] transition-all hover:-translate-y-1`}>
            <div className="flex items-center justify-center w-12 h-12 bg-white border-2 border-black mb-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-black mb-3">
                {title}
            </h3>
            <p className="text-gray-800 leading-relaxed">
                {description}
            </p>
        </div>
    );
}
