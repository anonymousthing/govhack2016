using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace BrisbaneLocateAPI.Controllers
{
    [RoutePrefix("api/index")]
    public class IndexController : ApiController
    {
        public IndexController()
        {
            
        }

        [HttpGet]
        public string[] Get()
        {
            List<string> strings = new List<string>() { "1", "2" };
            return strings.ToArray();
        }

        [Route("{id}")]
        [HttpGet]
        public string Get(string id)
        {
            return id;
        }
    }    
}
