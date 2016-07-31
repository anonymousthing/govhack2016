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
            return new FitnessEventService().GetEvents();
        }

        [HttpPost]
        public List<TrumbaEvent> Post(Location[] locations)
        {
            var events = new List<TrumbaEvent>();

            events.AddRange(new FitnessEventService().GetEvents());
            events.AddRange(new KidsEventService().GetEvents());
            events.AddRange(new CouncilEventService().GetEvents());
            events.AddRange(new ActiveParksService().GetEvents());
            events.AddRange(new FitnessEventService().GetEvents());

            events = events.Distinct().ToList();

            events = TrumbaService.ComputeGeocodes(events);

            foreach (var location in locations)
            {
                events = TrumbaService.FilterEventsByDistanceAndDate((double)location.Latitude, (double)location.Longitude, DateTime.Now, events, 2);
            }

            return events;
        }
    }    
}
