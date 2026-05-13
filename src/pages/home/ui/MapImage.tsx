interface MapImageProps {
  src?: string;
  count?: number;
  onClick?: () => void;
}

export const MapImage = ({ src = 'https://picsum.photos/87', count, onClick }: MapImageProps) => {
  return (
    <button
      type="button"
      className="rounded-1.5 absolute size-[87px] overflow-hidden border-4 border-white"
      onClick={onClick}
    >
      <img src={src} alt="" className="size-full object-cover" />
      {Boolean(count) && (
        <div className="absolute right-1 bottom-1 flex h-[21px] w-8 items-center justify-center rounded-[29px] bg-white text-gray-700">
          +{count}
        </div>
      )}
    </button>
  );
};
