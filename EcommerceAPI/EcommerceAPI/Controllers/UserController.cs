namespace EcommerceAPI.Controllers
{
    using EcommerceAPI.Data;
    using EcommerceAPI.Models;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using System.Security.Claims;

    [Authorize]
    [ApiController]
    [Route("api/user")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("profile")]
        public IActionResult GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized();

            var user = _context.Users.FirstOrDefault(u => u.Id.ToString() == userId);

            if (user == null)
                return NotFound();

            return Ok(new
            {
                name = user.Name,
<<<<<<< HEAD
                lastname = user.LastName,
=======
>>>>>>> 6e5bc13e524bf6c95a46101914a8d33bf539a831
                email = user.Email
            });
        }
    }
}
