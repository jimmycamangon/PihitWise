using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using PihitWise.Application.Contact;

namespace PihitWise.API.Controllers
{
    [ApiController]
    [Route("api/contact")]
    public class ContactController : ControllerBase
    {
        private readonly IContactService _contactService;

        public ContactController(IContactService contactService)
        {
            _contactService = contactService;
        }

        [HttpPost]  // POST /api/contact
        [EnableRateLimiting("contact")]
        public async Task<IActionResult> Send(ContactRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Message))
                return BadRequest("Name and message are required.");

            return await _contactService.SendAsync(request) switch
            {
                ContactResult.Sent => NoContent(),
                ContactResult.NotConfigured => StatusCode(503, "Messages aren't set up yet. Please try again later."),
                _ => StatusCode(502, "Your message couldn't be sent. Please try again later.")
            };
        }
    }
}
