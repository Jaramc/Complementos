using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PQRS.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddVectorIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"CREATE INDEX IF NOT EXISTS ix_kb_articles_vector_hnsw ON ""KnowledgeBaseArticles"" USING hnsw (""Vector"" vector_cosine_ops);");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS ix_kb_articles_vector_hnsw;");
        }
    }
}
