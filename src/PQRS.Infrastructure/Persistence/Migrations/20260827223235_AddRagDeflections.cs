using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PQRS.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRagDeflections : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ResolvedByRag",
                table: "Tickets");

            migrationBuilder.CreateTable(
                name: "RagDeflections",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    ArticleIds = table.Column<Guid[]>(type: "uuid[]", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RagDeflections", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RagDeflections_CreatedAtUtc",
                table: "RagDeflections",
                column: "CreatedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_RagDeflections_TenantId",
                table: "RagDeflections",
                column: "TenantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RagDeflections");

            migrationBuilder.AddColumn<bool>(
                name: "ResolvedByRag",
                table: "Tickets",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
