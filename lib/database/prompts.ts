import { createClient } from "@supabase/supabase-js"
import type { PromptTemplate, PromptVariable } from "@/lib/prompt-template-engine"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export interface CreatePromptData {
  name: string
  description?: string
  type: string
  content: string
  variables: PromptVariable[]
  metadata?: Record<string, any>
  is_active?: boolean
  created_by?: string
}

export interface UpdatePromptData {
  name?: string
  description?: string
  type?: string
  content?: string
  variables?: PromptVariable[]
  metadata?: Record<string, any>
  is_active?: boolean
}

export interface PromptFilters {
  type?: string
  active?: boolean
  search?: string
  created_by?: string
}

export class PromptsDatabase {
  /**
   * Get prompts with filtering and pagination
   */
  static async getPrompts(filters: PromptFilters = {}, page = 1, limit = 10) {
    let query = supabase.from("prompts").select("*", { count: "exact" }).order("updated_at", { ascending: false })

    // Apply filters
    if (filters.type) {
      query = query.eq("type", filters.type)
    }

    if (filters.active !== undefined) {
      query = query.eq("is_active", filters.active)
    }

    if (filters.created_by) {
      query = query.eq("created_by", filters.created_by)
    }

    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,type.ilike.%${filters.search}%`,
      )
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Failed to fetch prompts: ${error.message}`)
    }

    return {
      data: data as PromptTemplate[],
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    }
  }

  /**
   * Get a single prompt by ID
   */
  static async getPromptById(id: string): Promise<PromptTemplate | null> {
    const { data, error } = await supabase.from("prompts").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return null // Not found
      }
      throw new Error(`Failed to fetch prompt: ${error.message}`)
    }

    return data as PromptTemplate
  }

  /**
   * Create a new prompt
   */
  static async createPrompt(data: CreatePromptData): Promise<PromptTemplate> {
    const { data: prompt, error } = await supabase
      .from("prompts")
      .insert({
        name: data.name,
        description: data.description,
        type: data.type,
        content: data.content,
        variables: data.variables,
        metadata: data.metadata || {},
        is_active: data.is_active !== undefined ? data.is_active : true,
        created_by: data.created_by,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create prompt: ${error.message}`)
    }

    return prompt as PromptTemplate
  }

  /**
   * Update an existing prompt
   */
  static async updatePrompt(id: string, data: UpdatePromptData): Promise<PromptTemplate | null> {
    const updateData: any = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.type !== undefined) updateData.type = data.type
    if (data.content !== undefined) updateData.content = data.content
    if (data.variables !== undefined) updateData.variables = data.variables
    if (data.metadata !== undefined) updateData.metadata = data.metadata
    if (data.is_active !== undefined) updateData.is_active = data.is_active

    const { data: prompt, error } = await supabase.from("prompts").update(updateData).eq("id", id).select().single()

    if (error) {
      if (error.code === "PGRST116") {
        return null // Not found
      }
      throw new Error(`Failed to update prompt: ${error.message}`)
    }

    return prompt as PromptTemplate
  }

  /**
   * Delete a prompt
   */
  static async deletePrompt(id: string): Promise<boolean> {
    const { error } = await supabase.from("prompts").delete().eq("id", id)

    if (error) {
      throw new Error(`Failed to delete prompt: ${error.message}`)
    }

    return true
  }

  /**
   * Clone a prompt (create a new version)
   */
  static async clonePrompt(id: string, updates: Partial<CreatePromptData> = {}): Promise<PromptTemplate> {
    const original = await this.getPromptById(id)
    if (!original) {
      throw new Error("Original prompt not found")
    }

    const cloneData: CreatePromptData = {
      name: updates.name || `${original.name} (Copy)`,
      description: updates.description || original.description,
      type: updates.type || original.type,
      content: updates.content || original.content,
      variables: updates.variables || original.variables,
      metadata: updates.metadata || original.metadata,
      is_active: updates.is_active !== undefined ? updates.is_active : original.is_active,
      created_by: updates.created_by,
    }

    return this.createPrompt(cloneData)
  }

  /**
   * Increment usage count for a prompt
   */
  static async incrementUsage(id: string): Promise<void> {
    const { error } = await supabase.rpc("increment_prompt_usage", {
      prompt_id: id,
    })

    if (error) {
      console.error("Failed to increment prompt usage:", error)
      // Don't throw error as this is not critical
    }
  }

  /**
   * Get prompt types with counts
   */
  static async getPromptTypes(): Promise<Array<{ type: string; count: number }>> {
    const { data, error } = await supabase.from("prompts").select("type").eq("is_active", true)

    if (error) {
      throw new Error(`Failed to fetch prompt types: ${error.message}`)
    }

    // Count occurrences of each type
    const typeCounts = data.reduce((acc: Record<string, number>, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1
      return acc
    }, {})

    return Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
    }))
  }

  /**
   * Search prompts by content
   */
  static async searchPrompts(query: string, limit = 10): Promise<PromptTemplate[]> {
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`)
      .eq("is_active", true)
      .order("usage_count", { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to search prompts: ${error.message}`)
    }

    return data as PromptTemplate[]
  }
}
