import { useMutation } from '@tanstack/react-query';
import { deleteMedia } from './api';

export const useDeleteMedia = () =>
  useMutation({
    mutationFn: deleteMedia,
  });
