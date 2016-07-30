using CsvIngestion.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using RSSFeeds.Models;
using RSSFeeds.Services;

namespace BrisbaneLocateAPI.Controllers
{
    [RoutePrefix("event")]
    public class EventController : ApiController
    { 
        [HttpGet]
        public List<TrumbaEvent> Get()
        {
            return new FitnessEventService().GetFitnessEvents();
        }
    }    
}
