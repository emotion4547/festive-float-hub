import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon_url: string | null;
  sort_order: number;
  is_active: boolean;
  show_in_header: boolean;
  show_in_footer: boolean;
  show_in_floating: boolean;
  created_at: string;
  updated_at: string;
}

// Single query for all active social links — filtered on client to avoid duplicate requests
function useAllActiveSocialLinks() {
  return useQuery({
    queryKey: ["social-links", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as SocialLink[];
    },
  });
}

export function useSocialLinks(filter?: { header?: boolean; footer?: boolean; floating?: boolean }) {
  const { data: allLinks, ...rest } = useAllActiveSocialLinks();

  const filtered = allLinks?.filter((link) => {
    if (filter?.header && !link.show_in_header) return false;
    if (filter?.footer && !link.show_in_footer) return false;
    if (filter?.floating && !link.show_in_floating) return false;
    return true;
  });

  return { data: filtered, ...rest };
}

export function useAllSocialLinks() {
  return useQuery({
    queryKey: ["social-links", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as SocialLink[];
    },
  });
}

export function useCreateSocialLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (link: Omit<SocialLink, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("social_links")
        .insert(link)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-links"] });
      toast.success("Ссылка добавлена");
    },
    onError: (error) => {
      toast.error("Ошибка при добавлении: " + error.message);
    },
  });
}

export function useUpdateSocialLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SocialLink> & { id: string }) => {
      const { data, error } = await supabase
        .from("social_links")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-links"] });
      toast.success("Ссылка обновлена");
    },
    onError: (error) => {
      toast.error("Ошибка при обновлении: " + error.message);
    },
  });
}

export function useDeleteSocialLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("social_links")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-links"] });
      toast.success("Ссылка удалена");
    },
    onError: (error) => {
      toast.error("Ошибка при удалении: " + error.message);
    },
  });
}

export async function uploadSocialIcon(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("social-icons")
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from("social-icons")
    .getPublicUrl(fileName);

  return data.publicUrl;
}
