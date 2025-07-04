import { createServerSupabaseClient } from "@/lib/supabase/server"
import fs from "fs"
import path from "path"

interface Migration {
  id: string
  name: string
  sql: string
}

export class MigrationRunner {
  private supabase = createServerSupabaseClient()

  async ensureMigrationsTable() {
    const { error } = await this.supabase.rpc("exec_sql", {
      sql_query: `
        CREATE TABLE IF NOT EXISTS migrations (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    })

    if (error) {
      console.error("Error creating migrations table:", error)
      throw error
    }
  }

  async getMigration(id: string): Promise<Migration> {
    const sqlFilePath = path.join(process.cwd(), "lib", "migrations", "sql", `${id}.sql`)
    const sql = fs.readFileSync(sqlFilePath, "utf8")

    return {
      id,
      name: id.replace(/-/g, " "),
      sql,
    }
  }

  async hasBeenExecuted(migrationId: string): Promise<boolean> {
    const { data, error } = await this.supabase.from("migrations").select("id").eq("id", migrationId).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error checking migration status:", error)
      return false
    }

    return !!data
  }

  async executeMigration(migration: Migration): Promise<void> {
    console.log(`Executing migration: ${migration.name}`)

    const { error: sqlError } = await this.supabase.rpc("exec_sql", {
      sql_query: migration.sql,
    })

    if (sqlError) {
      console.error(`Error executing migration ${migration.id}:`, sqlError)
      throw sqlError
    }

    // Record that this migration has been executed
    const { error: recordError } = await this.supabase.from("migrations").insert({
      id: migration.id,
      name: migration.name,
    })

    if (recordError) {
      console.error(`Error recording migration ${migration.id}:`, recordError)
      throw recordError
    }

    console.log(`Migration ${migration.name} completed successfully`)
  }

  async runPendingMigrations(): Promise<void> {
    try {
      await this.ensureMigrationsTable()

      const migrationIds = [
        "001-add-user-id-to-job-resumes",
        // Add more migration IDs here as needed
      ]

      for (const migrationId of migrationIds) {
        const hasBeenExecuted = await this.hasBeenExecuted(migrationId)

        if (!hasBeenExecuted) {
          const migration = await this.getMigration(migrationId)
          await this.executeMigration(migration)
        } else {
          console.log(`Migration ${migrationId} already executed, skipping`)
        }
      }
    } catch (error) {
      console.error("Error running migrations:", error)
      throw error
    }
  }
}
