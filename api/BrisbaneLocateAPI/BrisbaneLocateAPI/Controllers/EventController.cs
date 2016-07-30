using CsvIngestion.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using RSSFeeds.Models;
using RSSFeeds.Services;
using BrisbaneLocateAPI.Models;

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

        [HttpPost]
        public List<TrumbaEvent> Post(Location[] locations)
        {
            var events = new List<TrumbaEvent>();

            foreach (var location in locations)
            {
                events.AddRange(TrumbaService.FilterEventsByDistanceAndDate((double)location.Latitude, (double)location.Longitude, DateTime.Now, new FitnessEventService().GetFitnessEvents(), 2));
            }

            return events.Distinct().ToList();
        }
    }    
}
