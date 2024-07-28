import { Card, CardBody, CardTitle, CardSubtitle, CardText, Stack, Container, Navbar, NavbarBrand, ListGroup, ListGroupItem, Accordion, AccordionItem, AccordionHeader, AccordionBody } from "react-bootstrap";

export default async function Home() {

  const curentDateTimeUTC = new Date();

  //TODO: insert current date
  const res = await fetch('https://sph-s-api.olympics.com/summer/schedules/api/ENG/schedule/day/2024-07-28')
  // The return value is *not* serialized

  let content: any;
 
  if (!res.ok) {
    content = <p>Could not fetch schedule, status [{res.statusText}]</p>
  }
  else
  {
    const data = await res.json();

    content = data["units"].map(
      (event: any) => {
        if (event["competitors"].length < 1)
        {
          // Don't care about events with no competitors, some weird group stuff or something.
          return null;
        }
        const startDateTimeUTC = new Date(event["startDate"]);
        let startHour = startDateTimeUTC.getHours();
        const startMinute = startDateTimeUTC.getMinutes();

        const startTime = `${startHour % 12 === 0 ? 12 : startHour % 12}:${startMinute < 10 ? '0' : ''}${startMinute}`;

        return (
            <Card key={event["id"]}>
              <CardBody>
                <CardTitle>{`${event["disciplineName"]} - ${startTime}${startHour < 12 ? "am" : "pm"}`}</CardTitle>
                <CardSubtitle>{event["eventUnitName"]}</CardSubtitle>
                {
                  event["competitors"].length > 2
                  ? <Accordion>
                      <AccordionItem eventKey="0">
                        <AccordionHeader>Competitors</AccordionHeader>
                        <AccordionBody>
                          <ListGroup variant="flush">
                              {
                                event["competitors"].map((comp: any) => {
                                  return (
                                    <ListGroupItem key={comp["order"]}>{`${comp["noc"]} - ${comp["name"]}`}</ListGroupItem>
                                  );
                                })
                              }
                          </ListGroup>
                        </AccordionBody>
                      </AccordionItem>
                    </Accordion>
                  : <ListGroup variant="flush">
                      {
                        event["competitors"].map((comp: any) => {
                          return (
                            <ListGroupItem key={comp["order"]}>{`${comp["noc"]} - ${comp["name"]}`}</ListGroupItem>
                          );
                        })
                      }
                    </ListGroup>
                }
              </CardBody>
            </Card>
        );
      }
    );
  }

  // statusDescriptions
  // Scheduled
  // Running
  // Finished
  // Getting Ready

  return (
    <>
    <Navbar bg="light" variant="light">
                <Container>
                    <NavbarBrand className="mx-auto">Schedule</NavbarBrand>
                </Container>
            </Navbar>
      <Container>
        <Stack gap={2} className="col-md-5 mx-auto">
          { content }
        </Stack>
      </Container>
    </>
  );
}
