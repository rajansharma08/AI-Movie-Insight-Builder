import { motion } from 'framer-motion';

interface LoaderProps {
  message?: string;
}

export default function Loader({ message = 'Loading...' }: LoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-2xl p-6 md:p-8"
    >
      <div className="animate-pulse space-y-5">
        <div className="h-6 w-56 bg-white/25 rounded-md" />
        <div className="h-5 w-40 bg-white/20 rounded-md" />
        <div className="h-40 w-full bg-white/15 rounded-xl" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-white/20 rounded" />
          <div className="h-4 w-[92%] bg-white/20 rounded" />
          <div className="h-4 w-[78%] bg-white/20 rounded" />
        </div>
      </div>
      <p className="mt-5 text-gray-200 font-medium">{message}</p>
    </motion.div>
  );
}
