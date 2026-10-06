using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Tienda.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Inventario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "niveles_existencias",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddCheckConstraint(
                name: "CK_niveles_existencias_cantidad",
                table: "niveles_existencias",
                sql: "\"Cantidad\" >= 0");

            migrationBuilder.CreateIndex(
                name: "IX_movimientos_existencias_OcurridoEn",
                table: "movimientos_existencias",
                column: "OcurridoEn");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_niveles_existencias_cantidad",
                table: "niveles_existencias");

            migrationBuilder.DropIndex(
                name: "IX_movimientos_existencias_OcurridoEn",
                table: "movimientos_existencias");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "niveles_existencias");
        }
    }
}
