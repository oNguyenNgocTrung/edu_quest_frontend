import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { MascotCustomization } from "@/types";

interface ApiResponse<T> {
  data: {
    id: string;
    type: string;
    attributes: T;
  };
}

interface PurchaseResponse {
  data: {
    id: string;
    type: string;
    attributes: Omit<MascotCustomization, "id">;
  };
  meta: {
    purchased_item: string;
    coins_remaining: number;
  };
}

function transformCustomization(response: ApiResponse<Omit<MascotCustomization, "id">>): MascotCustomization {
  return {
    id: response.data.id,
    ...response.data.attributes,
  };
}

export function useMascotCustomization() {
  return useQuery({
    queryKey: ["mascot-customization"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Omit<MascotCustomization, "id">>>("/mascot_customization");
      return transformCustomization(data);
    },
  });
}

export function usePurchaseItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data } = await apiClient.post<PurchaseResponse>("/mascot_customization/purchase", {
        item_id: itemId,
      });
      return {
        customization: {
          id: data.data.id,
          ...data.data.attributes,
        } as MascotCustomization,
        meta: data.meta,
      };
    },
    onSuccess: (result) => {
      queryClient.setQueryData(["mascot-customization"], result.customization);
      queryClient.invalidateQueries({ queryKey: ["child-profile"] });
    },
  });
}

export function useEquipItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data } = await apiClient.patch<ApiResponse<Omit<MascotCustomization, "id">>>("/mascot_customization/equip", {
        item_id: itemId,
      });
      return transformCustomization(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["mascot-customization"], data);
    },
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (avatarEmoji: string) => {
      const { data } = await apiClient.patch<ApiResponse<Omit<MascotCustomization, "id">>>("/mascot_customization/avatar", {
        avatar_emoji: avatarEmoji,
      });
      return transformCustomization(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["mascot-customization"], data);
    },
  });
}
