import { createServerSupabaseClient } from "./server"

export async function executeSql(sql: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    // Try to use exec_sql function first
    const { data, error } = await supabase.rpc("exec_sql", { sql_query: sql })

    // If there was an error with exec_sql, try direct execution
    if (error) {
      console.log("Error using exec_sql, will try direct execution:", error)

      // Split into statements and execute each one
      const statements = sql.split(";").filter((stmt) => stmt.trim().length > 0)

      for (const stmt of statements) {
        try {
          // Try direct query execution
          const { error: stmtError } = await supabase.query(stmt)

          if (stmtError) {
            console.error("Error executing SQL statement:", stmtError)
            return { success: false, error: stmtError.message }
          }
        } catch (execError) {
          console.error("Exception executing SQL statement:", execError)
          return {
            success: false,
            error: execError instanceof Error ? execError.message : "Unknown error",
          }
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Exception in executeSql:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
