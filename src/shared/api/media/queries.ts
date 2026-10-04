import { useMutation } from '@tanstack/react-query';
import { deleteMedia } from './api';
import { requestVoid } from '../request';

export const useDeleteMedia = () =>
  useMutation({
    mutationFn: (publicId: Parameters<typeof deleteMedia>[0]) =>
      requestVoid(() => deleteMedia(publicId)),
  });
