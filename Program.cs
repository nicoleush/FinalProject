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

      string path = request.Path.ToLower().TrimStart('/');

      if (File.Exists(request.Path))
      {
        var file = new File(request.Path);
        response.Send(file);
      }
      else if (request.Path == "profile")
      {
        var userId = request.GetBody<string>();
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
      else if (path == "signup")
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
      else if (path == "updatebio")
      {
        var (userId, newBio) = request.GetBody<(string, string)>();
        var user = database.Users.FirstOrDefault(u => u.Id == userId);

        if (user != null)
        {
          user.Bio = newBio;
          database.SaveChanges();
          response.Send("Bio updated");
        }
        else
        {
          response.SetStatusCode(404);
          response.Send("User not found");
        }
      }
      else if (path == "login")
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
      else if (path == "getuserposts")
      {
        var userId = request.GetBody<string>();
        var posts = database.Posts
          .Where(p => p.UserId == userId)
          .OrderByDescending(p => p.CreatedAt)
          .Select(p => new
          {
            p.Id,
            Title = p.Title,
            Content = p.Content,
            CreatedAt = p.CreatedAt.ToString("o")
          })
          .ToList();

        response.Send(posts);
      }
      else if (path == "createpost")
      {
        var (userId, title, content) = request.GetBody<(string, string, string)>();

        var post = new Post
        {
          UserId = userId,
          Title = title,
          Content = content
        };

        database.Posts.Add(post);
        database.SaveChanges();

        response.Send("Post created");
      }
      else if (path == "getposts")
      {
        var posts = database.Posts
          .OrderByDescending(p => p.CreatedAt)
          .Select(p => new
          {
            id = p.Id,
            title = p.Title,
            content = p.Content,
            createdAt = p.CreatedAt,
            username = database.Users.FirstOrDefault(u => u.Id == p.UserId)!.Username
          })
          .ToList();

        response.Send(posts);
      }
      else if (path == "likepost")
      {
        var (postId, userId) = request.GetBody<(int, string)>();
        var alreadyLiked = database.Likes.Any(l => l.PostId == postId && l.UserId == userId);

        if (!alreadyLiked)
        {
          database.Likes.Add(new Like { PostId = postId, UserId = userId });
          database.SaveChanges();
          response.Send("Liked");
        }
        else
        {
          response.Send("Already liked");
        }
      }
      else if (path == "getlikes")
      {
        var postId = request.GetBody<int>();
        var likeCount = database.Likes.Count(l => l.PostId == postId);
        response.Send(likeCount);
      }
      else if (path == "addcomment")
      {
        var (postId, userId, content) = request.GetBody<(int, string, string)>();
        var comment = new Comment
        {
          PostId = postId,
          UserId = userId,
          Content = content
        };
        database.Comments.Add(comment);
        database.SaveChanges();
        response.Send("Comment added");
      }
      else if (path == "getcomments")
      {
        var postId = request.GetBody<int>();
        var comments = database.Comments
          .Where(c => c.PostId == postId)
          .OrderBy(c => c.CreatedAt)
          .Select(c => new
          {
            c.UserId,
            c.Content,
            c.CreatedAt
          })
          .ToList();

        response.Send(comments);
      }
      else if (request.ExpectsHtml())
      {
        var file = new File("website/pages/404.html");
        response.SetStatusCode(404);
        response.Send(file);
      }
      else
      {
        response.SetStatusCode(400);
        response.Send($"Invalid request path: {request.Path}");
      }

      response.Close();
    }
  }
}

public class Database : DbContext
{
  public DbSet<User> Users { get; set; } = default!;
  public DbSet<Post> Posts { get; set; } = default!;
  public DbSet<Comment> Comments { get; set; } = default!;
  public DbSet<Like> Likes { get; set; } = default!;

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

public class Post
{
  [Key]
  public int Id { get; set; }
  public string UserId { get; set; }
  public string Title { get; set; }
  public string Content { get; set; }
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Comment
{
  [Key]
  public int Id { get; set; }
  public int PostId { get; set; }
  public string UserId { get; set; }
  public string Content { get; set; }
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Like
{
  [Key]
  public int Id { get; set; }
  public int PostId { get; set; }
  public string UserId { get; set; }
}
