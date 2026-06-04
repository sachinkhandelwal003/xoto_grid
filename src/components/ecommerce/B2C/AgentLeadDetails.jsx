import { Card, Typography, Row, Col, Tag, Button, Steps } from "antd";
import { useParams, useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Step } = Steps;

export default function AgentLeadDetails(){

  const { id } = useParams();
  const navigate = useNavigate();

  // dummy data (later from backend)
  const lead = {
    name:"Rahul Mehta",
    phone:"+91 9876543210", 
    project:"Sky Tower",
    budget:"1.2Cr - 1.5Cr",
    stage:1   // 0 customer, 1 lead, 2 visit, 3 deal
  };

  return(
    <div className="p-6">

      <Title level={3}>Lead Details fgdsfgdsgsd</Title>

      <Row gutter={[16,16]}>

        {/* LEFT INFO */}
        <Col xs={24} lg={12}>
          <Card className="shadow-sm rounded-xl">

            <Title level={5}>{lead.name}</Title>

            <div className="mb-2">
              <Text type="secondary">Phone:</Text><br/>
              <Text>{lead.phone}</Text>
            </div>

            <div className="mb-2">
              <Text type="secondary">Interested Project:</Text><br/>
              <Text>{lead.project}</Text>
            </div>

            <div className="mb-2">
              <Text type="secondary">Budget:</Text><br/>
              <Text>{lead.budget}</Text>
            </div>

            <Tag color="blue">Active Lead</Tag>

            <div className="mt-4">
              <Button
  type="default"
  block
  onClick={()=>navigate(`/dashboard/agent/lead/${id}/create-visit`)}
>
  Schedule Visit
</Button>
            </div>

          </Card>
        </Col>

        {/* RIGHT TIMELINE */}
        <Col xs={24} lg={12}>
          <Card className="shadow-sm rounded-xl">

            <Title level={5}>Lead Progress</Title>

            <Steps current={lead.stage} direction="vertical">
              <Step title="Customer Created"/>
              <Step title="Lead Qualified"/>
              <Step title="Site Visit"/>
              <Step title="Converted to Deal"/>
            </Steps>

         <Button
  type="primary"
  block
  onClick={() => {
  
  navigate(`/dashboard/agent/lead/${id}/create-deal`)
;
}}
>
  Convert to Deal
</Button>



          </Card>
        </Col>

      </Row>

    </div>
  )
}
