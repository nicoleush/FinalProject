using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

class Program
{
  static void Main()
  {
    int port = 5000;
    var server = new Server(port);

    Console.WriteLine("The server is running");
    Console.WriteLine($"Main Page: http://localhost:{port}/website/pages/index.html");

    var database = new Database();
    database.Database.EnsureCreated();

    while (true)
    {
      (var request, var response) = server.WaitForRequest();
      Console.WriteLine($"Received a request with the path: {request.Path}");

      if (File.Exists(request.Path))
      {
        var file = new File(request.Path);
        response.Send(file);
      }
      else if (request.ExpectsHtml())
      {
        var file = new File("website/pages/404.html");
        response.SetStatusCode(404);
        response.Send(file);
      }
      else
      {
        try
        {
          if (request.Path == "signup")
          {
            var (username, password, theme, bio, avatarUrl) = request.GetBody<(string, string, string, string, string)>();
            var userExists = database.Users.Any(user => user.Username == username);

            if (!userExists)
            {
              var userId = Guid.NewGuid().ToString();
              database.Users.Add(new User(userId, username, password, "", bio, avatarUrl, theme));
              database.SaveChanges();
              response.Send(userId);
            }
            else
            {
              response.SetStatusCode(409);
              response.Send("Username already exists");
            }
          }
          else if (request.Path == "login")
          {
            var (username, password) = request.GetBody<(string, string)>();
            var user = database.Users.FirstOrDefault(user => user.Username == username && user.Password == password);

            if (user != null)
            {
              response.Send(new
              {
                userId = user.Id,
                username = user.Username,
                bio = user.Bio,
                avatarUrl = user.AvatarUrl,
                theme = user.Theme
              });
            }
            else
            {
              response.SetStatusCode(401);
              response.Send("Invalid credentials");
            }
          }
          else if (request.Path.StartsWith("profile/"))
          {
            var userId = request.Path.Substring("profile/".Length);
            Console.WriteLine($"Looking up profile with ID: {userId}");

            var user = database.Users.FirstOrDefault(u => u.Id == userId);
            if (user != null)
            {
              response.Send(new
              {
                username = user.Username,
                bio = user.Bio,
                avatarUrl = user.AvatarUrl,
                theme = user.Theme
              });
            }
            else
            {
              response.SetStatusCode(404);
              response.Send("User not found");
            }
          }
          else
          {
            response.SetStatusCode(400);
            response.Send("Invalid request path");
          }

          database.SaveChanges();
        }
        catch (Exception exception)
        {
          Log.WriteException(exception);
        }
      }

      response.Close();
    }
  }
}

public class Database : DbContext
{
  public DbSet<User> Users { get; set; } = default!;

  protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
  {
    optionsBuilder.UseSqlite("Data Source=database.db");
  }
}

public class User
{
  [Key]
  public string Id { get; set; }
  public string Username { get; set; }
  public string Password { get; set; }
  public string Email { get; set; } = "";
  public string Bio { get; set; } = "";
  public string AvatarUrl { get; set; } = "";
  public string Theme { get; set; } = "light";

  public User() { }

  public User(string id, string username, string password, string email = "", string bio = "", string avatarUrl = "", string theme = "light")
  {
    Id = id;
    Username = username;
    Password = password;
    Email = email ?? "";
    Bio = bio ?? "";
    AvatarUrl = avatarUrl ?? "";
    Theme = theme ?? "light";
  }
}
