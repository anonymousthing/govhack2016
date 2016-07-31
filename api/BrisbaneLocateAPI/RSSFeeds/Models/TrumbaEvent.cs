using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RSSFeeds.Models
{
    public class TrumbaEvent
    {
        public string Title;
        public DateTime StartTime;
        public DateTime EndTime;
        public string Description;
        public string Link;
        public string EventActionLink;
        public string Cost;
        public string Requirements;
        public string AgeRestriction;
        public string Address;
        public Decimal Latitude;
        public Decimal Longitude;

        public override bool Equals(System.Object obj)
        {
            // If parameter is null return false.
            if (obj == null)
            {
                return false;
            }

            // If parameter cannot be cast to Point return false.
            TrumbaEvent p = obj as TrumbaEvent;
            if ((System.Object)p == null)
            {
                return false;
            }

            // Return true if the fields match:
            return (Title == p.Title) && (StartTime == p.StartTime) && (Address == p.Address);
        }

        public bool Equals(TrumbaEvent p)
        {
            // If parameter is null return false:
            if ((object)p == null)
            {
                return false;
            }

            // Return true if the fields match:
            return (Title == p.Title) && (StartTime == p.StartTime) && (Address == p.Address);
        }

        public override int GetHashCode()
        {
            return Title.GetHashCode() ^ StartTime.GetHashCode() ^ Address.GetHashCode();
        }
    }
}
