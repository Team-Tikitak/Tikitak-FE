import TikitakLogoIcon from '@/shared/assets/Logo/tikitakLogoIcon.svg?react';

interface MapImageProps {
  src?: string;
  count?: number;
  onClick?: () => void;
}

export const MapImage = ({ src, count, onClick }: MapImageProps) => {
  return (
    <button
      type="button"
      className="absolute size-[87px] overflow-hidden rounded-[6px] border-4 border-white"
      onClick={onClick}
    >
      {src ? (
        <img src={src} alt="" className="no-native-image size-full object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center bg-white">
          <TikitakLogoIcon className="size-10" aria-hidden="true" />
        </div>
      )}
      {Boolean(count) && (
        <div className="absolute right-1 bottom-1 flex h-[21px] w-8 items-center justify-center rounded-[29px] bg-white text-gray-700">
          +{count}
        </div>
      )}
    </button>
  );
};
